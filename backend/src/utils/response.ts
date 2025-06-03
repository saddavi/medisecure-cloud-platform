// MediSecure Cloud Platform - Response Utilities
// Standardized API responses for consistency and debugging

import { APIGatewayProxyResult } from "aws-lambda";
import { ApiResponse, ErrorCodes, MediSecureError } from "../types";
import { v4 as uuidv4 } from "uuid";

// ============= Response Builder =============

/**
 * Creates a standardized API response
 * @param statusCode - HTTP status code
 * @param success - Whether the operation was successful
 * @param message - Human-readable message
 * @param data - Optional response data
 * @param error - Optional error details
 * @returns APIGatewayProxyResult formatted response
 */
export function createResponse<T = any>(
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  error?: string
): APIGatewayProxyResult {
  const response: ApiResponse<T> = {
    statusCode,
    success,
    message,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Configure this properly for production
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: JSON.stringify(response),
  };
}

// ============= Success Responses =============

export function successResponse<T = any>(
  data?: T,
  message: string = "Success"
): APIGatewayProxyResult {
  return createResponse(200, true, message, data);
}

export function createdResponse<T = any>(
  data?: T,
  message: string = "Resource created successfully"
): APIGatewayProxyResult {
  return createResponse(201, true, message, data);
}

// ============= Error Responses =============

export function badRequestResponse(
  message: string = "Bad Request",
  errors?: string[]
): APIGatewayProxyResult {
  return createResponse(400, false, message, undefined, errors?.join(", "));
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): APIGatewayProxyResult {
  return createResponse(401, false, message);
}

export function forbiddenResponse(
  message: string = "Forbidden"
): APIGatewayProxyResult {
  return createResponse(403, false, message);
}

export function notFoundResponse(
  message: string = "Resource not found"
): APIGatewayProxyResult {
  return createResponse(404, false, message);
}

export function conflictResponse(
  message: string = "Resource already exists"
): APIGatewayProxyResult {
  return createResponse(409, false, message);
}

export function tooManyRequestsResponse(
  message: string = "Too many requests"
): APIGatewayProxyResult {
  return createResponse(429, false, message);
}

export function internalServerErrorResponse(
  message: string = "Internal server error",
  error?: string
): APIGatewayProxyResult {
  return createResponse(500, false, message, undefined, error);
}

// ============= MediSecure Error Handler =============

/**
 * Handles MediSecure-specific errors and converts them to appropriate HTTP responses
 * @param error - MediSecure error object
 * @returns APIGatewayProxyResult
 */
export function handleMediSecureError(
  error: MediSecureError
): APIGatewayProxyResult {
  switch (error.code) {
    case ErrorCodes.VALIDATION_ERROR:
      return badRequestResponse(error.message, error.details);

    case ErrorCodes.AUTHENTICATION_ERROR:
    case ErrorCodes.INVALID_CREDENTIALS:
      return unauthorizedResponse(error.message);

    case ErrorCodes.AUTHORIZATION_ERROR:
      return forbiddenResponse(error.message);

    case ErrorCodes.USER_EXISTS:
      return conflictResponse(error.message);

    case ErrorCodes.USER_NOT_FOUND:
      return notFoundResponse(error.message);

    case ErrorCodes.EMAIL_NOT_VERIFIED:
      return badRequestResponse(error.message);

    case ErrorCodes.RATE_LIMIT_EXCEEDED:
      return tooManyRequestsResponse(error.message);

    case ErrorCodes.INTERNAL_ERROR:
    default:
      return internalServerErrorResponse(error.message);
  }
}

// ============= Logger =============

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Structured logging for Lambda functions
 * @param level - Log level
 * @param message - Log message
 * @param data - Optional structured data
 */
export function log(level: LogLevel, message: string, data?: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "medisecure-backend",
    ...(data && { data }),
  };

  console.log(JSON.stringify(logEntry));
}

// ============= Request Parser =============

/**
 * Safely parses JSON from Lambda event body
 * @param body - Request body string
 * @returns Parsed object or null if invalid
 */
export function parseRequestBody<T = any>(body: string | null): T | null {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    log(LogLevel.WARN, "Failed to parse request body", {
      body,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

// ============= Environment Configuration =============

/**
 * Gets environment variable with fallback
 * @param key - Environment variable key
 * @param fallback - Fallback value if not found
 * @returns Environment variable value or fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Validates that all required environment variables are set
 * @param requiredVars - Array of required environment variable names
 * @throws Error if any required variable is missing
 */
export function validateEnvironment(requiredVars: string[]): void {
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Validates API Gateway request structure
 * @param event - API Gateway event
 * @param requiredFields - Array of required fields in the request body
 * @returns Parsed request body or throws validation error
 */
export function validateRequest<T = any>(
  event: { body?: string | null; httpMethod?: string; pathParameters?: any },
  requiredFields: string[] = []
): T {
  // Validate HTTP method
  if (!event.httpMethod) {
    throw new Error("HTTP method is required");
  }

  // For GET requests, return path parameters
  if (event.httpMethod === "GET") {
    return (event.pathParameters || {}) as T;
  }

  // For POST/PUT requests, validate body
  if (!event.body) {
    throw new Error("Request body is required");
  }

  let requestData: any;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }

  // Validate required fields
  const missingFields = requiredFields.filter((field) => !requestData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return requestData as T;
}
