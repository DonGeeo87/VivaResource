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

/**
 * Custom hook that uses IntersectionObserver to detect when an element is in view.
 * Uses a callback ref to ensure the observer is set up when the element mounts.
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

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const ref = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer if node changes
    cleanupObserver();

    if (!node) return;

    // If triggerOnce and already triggered, don't observe
    if (triggerOnce && hasTriggeredRef.current) {
      setIsInView(true);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupObserver();
    };
  }, [cleanupObserver]);

  return { ref, isInView };
}
