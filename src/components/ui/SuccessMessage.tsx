"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface SuccessMessageProps {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

const typeConfig: Record<ToastType, { icon: typeof CheckCircle; bgColor: string; borderColor: string; textColor: string; iconColor: string }> = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

export default function SuccessMessage({
  type = "success",
  title,
  message,
  duration = 5000,
  onClose,
  showCloseButton = true,
  className = "",
}: SuccessMessageProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  if (!isVisible) return <></>;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-xl p-4
        ${isAnimating ? "animate-modal-in" : "animate-modal-out"}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-semibold ${config.textColor}`}>{title}</p>
          {message && (
            <p className={`text-sm ${config.textColor} opacity-80 mt-1`}>{message}</p>
          )}
        </div>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className={`p-1 rounded-full hover:bg-black/5 ${config.textColor} opacity-60 hover:opacity-100 transition-opacity`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
