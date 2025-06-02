// MediSecure Cloud Platform - Validation Utilities
// Healthcare-grade input validation for security and compliance

import Joi from "joi";
import {
  ValidationResult,
  UserRegistrationRequest,
  UserLoginRequest,
} from "../types";

// ============= Password Validation =============
// HIPAA Recommendation: Strong passwords with complexity requirements
const passwordSchema = Joi.string()
  .min(12)
  .max(128)
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
  .required()
  .messages({
    "string.min": "Password must be at least 12 characters long",
    "string.max": "Password must not exceed 128 characters",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
    "any.required": "Password is required",
  });

// ============= Email Validation =============
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  });

// ============= Phone Number Validation =============
// Qatar phone number format: +974-XXXX-XXXX or similar international formats
const phoneSchema = Joi.string()
  .pattern(new RegExp("^(\\+[1-9]\\d{1,14})$"))
  .optional()
  .messages({
    "string.pattern.base":
      "Phone number must be in international format (e.g., +97412345678)",
  });

// ============= User Registration Validation =============
const registrationSchema = Joi.object<UserRegistrationRequest>({
  email: emailSchema,
  password: passwordSchema,
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp("^[a-zA-Z\\s\\-'\\.]+$"))
    .required()
    .messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name must not exceed 50 characters",
      "string.pattern.base":
        "First name can only contain letters, spaces, hyphens, apostrophes, and periods",
      "any.required": "First name is required",
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(new RegExp("^[a-zA-Z\\s\\-'\\.]+$"))
    .required()
    .messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name must not exceed 50 characters",
      "string.pattern.base":
        "Last name can only contain letters, spaces, hyphens, apostrophes, and periods",
      "any.required": "Last name is required",
    }),
  phoneNumber: phoneSchema,
  dateOfBirth: Joi.string()
    .pattern(new RegExp("^d{4}-d{2}-d{2}$"))
    .optional()
    .messages({
      "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
    }),
  acceptedTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms and conditions acceptance is required",
  }),
  acceptedPrivacyPolicy: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the privacy policy",
    "any.required": "Privacy policy acceptance is required",
  }),
});

// ============= User Login Validation =============
const loginSchema = Joi.object<UserLoginRequest>({
  email: emailSchema,
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// ============= Validation Functions =============

/**
 * Validates user registration data
 * @param data - User registration request data
 * @returns ValidationResult with success status and any errors
 */
export function validateRegistration(data: any): ValidationResult {
  const { error } = registrationSchema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validates user login data
 * @param data - User login request data
 * @returns ValidationResult with success status and any errors
 */
export function validateLogin(data: any): ValidationResult {
  const { error } = loginSchema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 * @param input - String input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input.trim().replace(/[<>\"'&]/g, (match) => {
    const entities: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    };
    return entities[match] || match;
  });
}

/**
 * Validates Qatar-specific data formats
 * @param data - Data to validate
 * @returns ValidationResult
 */
export function validateQatarSpecific(data: any): ValidationResult {
  const errors: string[] = [];

  // Qatar ID validation (if provided)
  if (data.qatarId) {
    const qatarIdPattern = /^\d{11}$/;
    if (!qatarIdPattern.test(data.qatarId)) {
      errors.push("Qatar ID must be 11 digits");
    }
  }

  // Qatar phone number validation (if provided)
  if (data.phoneNumber && data.phoneNumber.startsWith("+974")) {
    const qatarPhonePattern = /^\+974[3456789]\d{7}$/;
    if (!qatarPhonePattern.test(data.phoneNumber)) {
      errors.push("Qatar phone number format is invalid (+974XXXXXXXX)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
