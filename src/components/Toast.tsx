"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps): React.ReactElement | null {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return <></>;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg border-l-4 shadow-lg ${styles[type]} animate-slide-up`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast(): {
  showToast: (message: string, type: ToastType) => void;
  Toast: () => React.ReactElement;
} {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  const ToastComponent = () => toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={isVisible}
      onClose={hideToast}
    />
  ) : <></>;

  return { showToast, Toast: ToastComponent };
}
