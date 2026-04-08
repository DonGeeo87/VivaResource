"use client";

import { useState, useCallback, useMemo } from "react";

type ValidationRule<T> = {
  required?: string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  email?: string;
  phone?: string;
  custom?: {
    validator: (value: T) => boolean;
    message: string;
  };
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

interface UseFormValidationOptions<T> {
  rules: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  options: UseFormValidationOptions<T>
) {
  const { rules, validateOnChange = false, validateOnBlur = true } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | null => {
      const rule = rules[name];
      if (!rule) return null;

      // Required check
      if (rule.required) {
        if (value === undefined || value === null || value === "") {
          return rule.required;
        }
        if (typeof value === "string" && value.trim() === "") {
          return rule.required;
        }
      }

      // Skip other validations if field is empty and not required
      if (value === "" || value === undefined || value === null) {
        return null;
      }

      const strValue = String(value);

      // Min length check
      if (rule.minLength) {
        if (strValue.length < rule.minLength.value) {
          return rule.minLength.message;
        }
      }

      // Max length check
      if (rule.maxLength) {
        if (strValue.length > rule.maxLength.value) {
          return rule.maxLength.message;
        }
      }

      // Email validation
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
          return rule.email;
        }
      }

      // Phone validation
      if (rule.phone) {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
        if (!phoneRegex.test(strValue) || strValue.replace(/\D/g, "").length < 10) {
          return rule.phone;
        }
      }

      // Pattern validation
      if (rule.pattern) {
        if (!rule.pattern.value.test(strValue)) {
          return rule.pattern.message;
        }
      }

      // Custom validation
      if (rule.custom) {
        if (!rule.custom.validator(value as T[keyof T])) {
          return rule.custom.message;
        }
      }

      return null;
    },
    [rules]
  );

  const validateAll = useCallback((): ValidationResult => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(rules) as Array<keyof T>).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors as Record<string, string> };
  }, [rules, validateField, values]);

  const handleChange = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validateOnChange) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error || undefined,
        }));
      }
    },
    [validateField, validateOnChange]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({
          ...prev,
          [name]: error || undefined,
        }));
      }
    },
    [validateField, validateOnBlur, values]
  );

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  const getError = useCallback(
    (name: keyof T): string | undefined => {
      if (touched[name] && errors[name]) {
        return errors[name];
      }
      return undefined;
    },
    [errors, touched]
  );

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    setValues,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    reset,
    getError,
    hasErrors,
    isValid: !hasErrors && Object.keys(touched).length > 0,
  };
}

// Common validation rules
export const validationRules = {
  required: (message = "This field is required") => ({ required: message }),
  
  email: (message = "Please enter a valid email address") => ({ email: message }),
  
  phone: (message = "Please enter a valid phone number") => ({ phone: message }),
  
  minLength: (min: number, message?: string) => ({
    minLength: {
      value: min,
      message: message || `Must be at least ${min} characters`,
    },
  }),
  
  maxLength: (max: number, message?: string) => ({
    maxLength: {
      value: max,
      message: message || `Must be no more than ${max} characters`,
    },
  }),
  
  pattern: (regex: RegExp, message: string) => ({
    pattern: { value: regex, message },
  }),
  
  strongPassword: (message = "Password must contain uppercase, lowercase, number, and special character") => ({
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
      message,
    },
  }),
};
