// MediSecure Cloud Platform - User Login Lambda Function
// Healthcare-grade user authentication with JWT token management

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { CognitoService } from "../utils/cognito";
import { validateLogin } from "../utils/validation";
import {
  parseRequestBody,
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  internalServerErrorResponse,
  log,
  LogLevel,
  validateEnvironment,
} from "../utils/response";
import { UserLoginRequest } from "../types";

// ============= Environment Validation =============
const REQUIRED_ENV_VARS = [
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID",
  "AWS_REGION",
];

try {
  validateEnvironment(REQUIRED_ENV_VARS);
  log(LogLevel.INFO, "Environment validation passed for login handler");
} catch (error) {
  log(LogLevel.ERROR, "Environment validation failed for login handler", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
  throw error;
}

// ============= Initialize Services =============
const cognitoService = new CognitoService();

// ============= Lambda Handler =============

/**
 * AWS Lambda handler for user authentication
 *
 * This function handles user login for the MediSecure healthcare platform.
 * It validates credentials against AWS Cognito and returns JWT tokens for successful authentication.
 *
 * Security Features:
 * - Input validation and sanitization
 * - Rate limiting through Cognito
 * - Secure JWT token handling
 * - Comprehensive audit logging
 * - Protection against brute force attacks
 *
 * @param event - API Gateway proxy event containing login credentials
 * @param context - Lambda execution context
 * @returns Promise<APIGatewayProxyResult> - Authentication response with tokens
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const requestId = context.awsRequestId;

  log(LogLevel.INFO, "User login request started", {
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
      log(LogLevel.WARN, "Invalid HTTP method for login", {
        requestId,
        method: event.httpMethod,
      });
      return badRequestResponse("Only POST method is allowed for user login");
    }

    // ============= Parse Request Body =============
    const loginData = parseRequestBody<UserLoginRequest>(event.body);

    if (!loginData) {
      log(LogLevel.WARN, "Invalid request body for login", { requestId });
      return badRequestResponse("Invalid JSON in request body");
    }

    // Log login attempt (without password for security)
    log(LogLevel.INFO, "Login attempt", {
      requestId,
      email: loginData.email,
      sourceIp: event.requestContext.identity.sourceIp,
    });

    // ============= Validate Input Data =============
    const validation = validateLogin(loginData);
    if (!validation.isValid) {
      log(LogLevel.WARN, "Login validation failed", {
        requestId,
        email: loginData.email,
        errors: validation.errors,
      });
      return badRequestResponse("Validation failed", validation.errors);
    }

    log(LogLevel.DEBUG, "Login validation passed", {
      requestId,
      email: loginData.email,
    });

    // ============= Authenticate User with Cognito =============
    const authResult = await cognitoService.authenticateUser(loginData);

    if (authResult.success) {
      log(LogLevel.INFO, "User authentication successful", {
        requestId,
        email: loginData.email,
        hasAccessToken: !!authResult.accessToken,
        hasRefreshToken: !!authResult.refreshToken,
        hasIdToken: !!authResult.idToken,
      });

      // Return success response with tokens (but log token presence only, not actual tokens)
      return successResponse(
        {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
          idToken: authResult.idToken,
          expiresIn: authResult.expiresIn,
          tokenType: "Bearer",
          message: authResult.message,
        },
        "Authentication successful"
      );
    } else {
      log(LogLevel.WARN, "User authentication failed", {
        requestId,
        email: loginData.email,
        reason: authResult.message,
      });

      // Return appropriate error response based on the authentication failure
      if (authResult.message.includes("verify your email")) {
        return badRequestResponse(authResult.message);
      } else if (
        authResult.message.includes("Invalid email or password") ||
        authResult.message.includes("No account found")
      ) {
        return unauthorizedResponse(authResult.message);
      } else if (authResult.message.includes("Too many")) {
        return {
          statusCode: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Retry-After": "300", // 5 minutes
          },
          body: JSON.stringify({
            success: false,
            message: authResult.message,
            timestamp: new Date().toISOString(),
            requestId,
          }),
        };
      } else {
        return unauthorizedResponse(authResult.message);
      }
    }
  } catch (error) {
    // ============= Handle Unexpected Errors =============
    log(LogLevel.ERROR, "Unexpected error in user login", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return internalServerErrorResponse(
      "An unexpected error occurred during authentication. Please try again later.",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    log(LogLevel.INFO, "User login request completed", {
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

// ============= Token Validation Export =============
/**
 * Utility function to validate JWT tokens (for use in other Lambda functions)
 * @param token - JWT token to validate
 * @returns Promise<boolean> - Token validity
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    // In a production environment, you would verify the JWT signature
    // against Cognito's public keys. For now, we'll do basic validation.

    if (!token || token.split(".").length !== 3) {
      return false;
    }

    // Decode the payload (without verification - for demonstration)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // Check if token is from our user pool
    if (
      !payload.iss ||
      !payload.iss.includes(process.env.COGNITO_USER_POOL_ID)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    log(LogLevel.ERROR, "Token validation error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
};
