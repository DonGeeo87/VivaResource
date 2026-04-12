"use client";

import { useState, useEffect, useRef, useCallback, RefCallback } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewReturn {
  ref: RefCallback<HTMLElement>;
  isInView: boolean;
}

function isIntersectionObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Custom hook that uses IntersectionObserver to detect when an element is in view.
 * Uses a callback ref to ensure the observer is set up when the element mounts.
 * Falls back to always-visible for browsers without IntersectionObserver support.
 * 
 * @param options - Configuration options for the observer
 * @returns Object containing ref (callback) and isInView boolean
 */
export function useInView({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseInViewOptions = {}): UseInViewReturn {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, []);

  const ref = useCallback((node: HTMLElement | null) => {
    cleanupObserver();

    if (!node) return;

    if (triggerOnce && hasTriggeredRef.current) {
      setIsInView(true);
      return;
    }

    // Fallback for browsers without IntersectionObserver
    if (!isIntersectionObserverSupported()) {
      fallbackTimeoutRef.current = setTimeout(() => {
        setIsInView(true);
        hasTriggeredRef.current = true;
      }, 100);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          hasTriggeredRef.current = true;
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(node);
  }, [threshold, rootMargin, triggerOnce, cleanupObserver]);

  useEffect(() => {
    return () => {
      cleanupObserver();
      // Clean up fallback timeout to prevent memory leak
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [cleanupObserver]);

  return { ref, isInView };
}
