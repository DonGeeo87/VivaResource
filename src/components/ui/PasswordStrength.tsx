"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  test: (password: string) => boolean;
  label: string;
}

const requirements: Requirement[] = [
  { test: (p) => p.length >= 8, label: "At least 8 characters" },
  { test: (p) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p) => /[0-9]/.test(p), label: "One number" },
  { test: (p) => /[^a-zA-Z0-9]/.test(p), label: "One special character" },
];

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  
  const passedCount = requirements.filter((req) => req.test(password)).length;
  const score = (passedCount / requirements.length) * 100;
  
  if (score <= 20) return { score, label: "Very Weak", color: "bg-red-500" };
  if (score <= 40) return { score, label: "Weak", color: "bg-orange-500" };
  if (score <= 60) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score <= 80) return { score, label: "Good", color: "bg-lime-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export default function PasswordStrength({
  password,
  showRequirements = true,
  className = "",
}: PasswordStrengthProps): JSX.Element | null {
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password]);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Password strength</span>
          <span className={`font-medium ${
            strength.label === "Very Weak" || strength.label === "Weak" 
              ? "text-red-500" 
              : strength.label === "Fair" 
              ? "text-yellow-500" 
              : "text-green-500"
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <li
                key={index}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  passed ? "text-green-600" : "text-gray-400"
                }`}
              >
                {passed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                {req.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Validation function for useFormValidation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return { valid: errors.length === 0, errors };
}
