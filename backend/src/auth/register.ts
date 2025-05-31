// MediSecure Cloud Platform - User Registration Lambda Function
// Healthcare-grade user registration with Cognito integration

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { CognitoService } from "../utils/cognito";
import {
  validateRegistration,
  validateQatarSpecific,
} from "../utils/validation";
import {
  parseRequestBody,
  successResponse,
  badRequestResponse,
  internalServerErrorResponse,
  log,
  LogLevel,
  validateEnvironment,
} from "../utils/response";
import { UserRegistrationRequest } from "../types";

// ============= Environment Validation =============
// Ensure all required environment variables are set on Lambda startup
const REQUIRED_ENV_VARS = [
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID",
  "AWS_REGION",
];

try {
  validateEnvironment(REQUIRED_ENV_VARS);
  log(LogLevel.INFO, "Environment validation passed");
} catch (error) {
  log(LogLevel.ERROR, "Environment validation failed", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
  throw error;
}

// ============= Initialize Services =============
const cognitoService = new CognitoService();

// ============= Lambda Handler =============

/**
 * AWS Lambda handler for user registration
 *
 * This function handles user registration for the MediSecure healthcare platform.
 * It validates input data, creates a new user in AWS Cognito, and returns appropriate responses.
 *
 * Security Features:
 * - Input validation and sanitization
 * - Healthcare-grade password requirements
 * - Qatar-specific data validation
 * - Structured error handling and logging
 * - CORS support for web frontend integration
 *
 * @param event - API Gateway proxy event containing user registration data
 * @param context - Lambda execution context
 * @returns Promise<APIGatewayProxyResult> - Standardized API response
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Generate request ID for tracing and debugging
  const requestId = context.awsRequestId;

  log(LogLevel.INFO, "User registration request started", {
    requestId,
    httpMethod: event.httpMethod,
    sourceIp: event.requestContext.identity.sourceIp,
    userAgent: event.headers["User-Agent"],
  });

  try {
    // ============= Handle CORS Preflight =============
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: "",
      };
    }

    // ============= Validate HTTP Method =============
    if (event.httpMethod !== "POST") {
      log(LogLevel.WARN, "Invalid HTTP method", {
        requestId,
        method: event.httpMethod,
      });
      return badRequestResponse(
        "Only POST method is allowed for user registration"
      );
    }

    // ============= Parse Request Body =============
    const requestData = parseRequestBody<UserRegistrationRequest>(event.body);

    if (!requestData) {
      log(LogLevel.WARN, "Invalid request body", { requestId });
      return badRequestResponse("Invalid JSON in request body");
    }

    log(LogLevel.DEBUG, "Request data parsed", {
      requestId,
      email: requestData.email,
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      hasPhoneNumber: !!requestData.phoneNumber,
      hasDateOfBirth: !!requestData.dateOfBirth,
    });

    // ============= Validate Input Data =============

    // Standard validation (password strength, email format, etc.)
    const standardValidation = validateRegistration(requestData);
    if (!standardValidation.isValid) {
      log(LogLevel.WARN, "Standard validation failed", {
        requestId,
        errors: standardValidation.errors,
      });
      return badRequestResponse("Validation failed", standardValidation.errors);
    }

    // Qatar-specific validation (if applicable)
    const qatarValidation = validateQatarSpecific(requestData);
    if (!qatarValidation.isValid) {
      log(LogLevel.WARN, "Qatar-specific validation failed", {
        requestId,
        errors: qatarValidation.errors,
      });
      return badRequestResponse("Validation failed", qatarValidation.errors);
    }

    log(LogLevel.INFO, "Input validation passed", { requestId });

    // ============= Register User with Cognito =============
    const registrationResult = await cognitoService.registerUser(requestData);

    if (registrationResult.success) {
      log(LogLevel.INFO, "User registration completed successfully", {
        requestId,
        userId: registrationResult.userId,
        email: requestData.email,
        verificationRequired: registrationResult.verificationRequired,
      });

      // Return success response with user data (excluding sensitive information)
      return successResponse(
        {
          userId: registrationResult.userId,
          email: requestData.email,
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          verificationRequired: registrationResult.verificationRequired,
          message: registrationResult.message,
        },
        "User registration successful"
      );
    } else {
      log(LogLevel.WARN, "User registration failed", {
        requestId,
        email: requestData.email,
        reason: registrationResult.message,
      });

      // Return appropriate error response based on the registration failure
      if (registrationResult.message.includes("already exists")) {
        return badRequestResponse(registrationResult.message);
      } else if (registrationResult.message.includes("Password")) {
        return badRequestResponse(registrationResult.message);
      } else {
        return internalServerErrorResponse(registrationResult.message);
      }
    }
  } catch (error) {
    // ============= Handle Unexpected Errors =============
    log(LogLevel.ERROR, "Unexpected error in user registration", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return internalServerErrorResponse(
      "An unexpected error occurred during registration. Please try again later.",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    log(LogLevel.INFO, "User registration request completed", {
      requestId,
      duration:
        Date.now() -
        (context.getRemainingTimeInMillis
          ? context.getRemainingTimeInMillis() -
            context.getRemainingTimeInMillis()
          : 0),
    });
  }
};

// ============= Health Check Export =============
// Optional: Export a simple health check function for monitoring
export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
  };
};
