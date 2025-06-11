// MediSecure Cloud Platform - AWS Cognito Service
// Healthcare-grade user authentication and management

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AdminConfirmSignUpCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  UserRegistrationRequest,
  UserRegistrationResponse,
  UserLoginRequest,
  UserLoginResponse,
  ErrorCodes,
  MediSecureError,
  CognitoConfig,
} from "../types";
import { log, LogLevel, getEnvVar } from "../utils/response";
import { createHmac } from "crypto";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private config: CognitoConfig;

  constructor() {
    // Load configuration from environment variables
    this.config = {
      userPoolId: getEnvVar("COGNITO_USER_POOL_ID", "ap-south-1_4Cr7XFUmS"),
      clientId: getEnvVar("COGNITO_CLIENT_ID", "9poj7iavug62uuif7sve7a6fo"),
      clientSecret: getEnvVar("COGNITO_CLIENT_SECRET"),
      region: getEnvVar("AWS_REGION", "ap-south-1"),
    };

    this.client = new CognitoIdentityProviderClient({
      region: this.config.region,
    });

    log(LogLevel.INFO, "CognitoService initialized", {
      userPoolId: this.config.userPoolId,
      region: this.config.region,
    });
  }

  // ============= SECRET_HASH Generation =============

  /**
   * Generates SECRET_HASH required for Cognito operations when client secret is used
   * @param username - The username (email in our case)
   * @returns The computed SECRET_HASH
   */
  private generateSecretHash(username: string): string | undefined {
    if (!this.config.clientSecret) {
      return undefined;
    }

    const message = username + this.config.clientId;
    const hash = createHmac("sha256", this.config.clientSecret)
      .update(message)
      .digest("base64");

    return hash;
  }

  // ============= User Registration =============

  /**
   * Registers a new user in Cognito User Pool
   * @param userData - User registration data
   * @returns Promise<UserRegistrationResponse>
   */
  async registerUser(
    userData: UserRegistrationRequest
  ): Promise<UserRegistrationResponse> {
    try {
      log(LogLevel.INFO, "Starting user registration", {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      const secretHash = this.generateSecretHash(userData.email);
      const command = new SignUpCommand({
        ClientId: this.config.clientId,
        Username: userData.email,
        Password: userData.password,
        ...(secretHash && { SecretHash: secretHash }),
        UserAttributes: [
          {
            Name: "email",
            Value: userData.email,
          },
          {
            Name: "given_name",
            Value: userData.firstName,
          },
          {
            Name: "family_name",
            Value: userData.lastName,
          },
          ...(userData.phoneNumber
            ? [
                {
                  Name: "phone_number",
                  Value: userData.phoneNumber,
                },
              ]
            : []),
          ...(userData.dateOfBirth
            ? [
                {
                  Name: "birthdate",
                  Value: userData.dateOfBirth,
                },
              ]
            : []),
        ],
      });

      const result = await this.client.send(command);

      log(LogLevel.INFO, "User registration successful", {
        userId: result.UserSub,
        email: userData.email,
      });

      return {
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        userId: result.UserSub,
        verificationRequired: !result.UserConfirmed,
      };
    } catch (error: any) {
      log(LogLevel.ERROR, "User registration failed", {
        email: userData.email,
        error: error.message,
        errorCode: error.name,
      });

      return this.handleCognitoError(error, "Registration failed");
    }
  }

  // ============= User Authentication =============

  /**
   * Authenticates a user with email and password
   * @param loginData - User login credentials
   * @returns Promise<UserLoginResponse>
   */
  async authenticateUser(
    loginData: UserLoginRequest
  ): Promise<UserLoginResponse> {
    try {
      log(LogLevel.INFO, "Starting user authentication", {
        email: loginData.email,
      });

      const secretHash = this.generateSecretHash(loginData.email);
      const authParameters: Record<string, string> = {
        USERNAME: loginData.email,
        PASSWORD: loginData.password,
      };

      if (secretHash) {
        authParameters.SECRET_HASH = secretHash;
      }

      const command = new InitiateAuthCommand({
        ClientId: this.config.clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: authParameters,
      });

      const result = await this.client.send(command);

      if (result.AuthenticationResult) {
        log(LogLevel.INFO, "User authentication successful", {
          email: loginData.email,
        });

        return {
          success: true,
          message: "Authentication successful",
          accessToken: result.AuthenticationResult.AccessToken,
          refreshToken: result.AuthenticationResult.RefreshToken,
          idToken: result.AuthenticationResult.IdToken,
          expiresIn: result.AuthenticationResult.ExpiresIn,
        };
      }

      // Handle challenge responses (e.g., email verification required)
      if (result.ChallengeName) {
        log(LogLevel.WARN, "Authentication challenge required", {
          email: loginData.email,
          challenge: result.ChallengeName,
        });

        return {
          success: false,
          message: this.getChallengeMessage(result.ChallengeName),
        };
      }

      throw new Error(
        "Authentication failed: Unexpected response from Cognito"
      );
    } catch (error: any) {
      log(LogLevel.ERROR, "User authentication failed", {
        email: loginData.email,
        error: error.message,
        errorCode: error.name,
      });

      return this.handleAuthError(error);
    }
  }

  // ============= Email Verification =============

  /**
   * Confirms user email with verification code
   * @param email - User email
   * @param confirmationCode - Verification code
   * @returns Promise<boolean>
   */
  async confirmEmailVerification(
    email: string,
    confirmationCode: string
  ): Promise<boolean> {
    try {
      log(LogLevel.INFO, "Confirming email verification", { email });

      const secretHash = this.generateSecretHash(email);
      const command = new ConfirmSignUpCommand({
        ClientId: this.config.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await this.client.send(command);

      log(LogLevel.INFO, "Email verification confirmed", { email });
      return true;
    } catch (error: any) {
      log(LogLevel.ERROR, "Email verification failed", {
        email,
        error: error.message,
        errorCode: error.name,
      });
      return false;
    }
  }

  /**
   * Resends email verification code
   * @param email - User email
   * @returns Promise<boolean>
   */
  async resendVerificationCode(email: string): Promise<boolean> {
    try {
      log(LogLevel.INFO, "Resending verification code", { email });

      const secretHash = this.generateSecretHash(email);
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.config.clientId,
        Username: email,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await this.client.send(command);

      log(LogLevel.INFO, "Verification code resent", { email });
      return true;
    } catch (error: any) {
      log(LogLevel.ERROR, "Failed to resend verification code", {
        email,
        error: error.message,
        errorCode: error.name,
      });
      return false;
    }
  }

  // ============= Password Reset =============

  /**
   * Initiates password reset process
   * @param email - User email
   * @returns Promise<boolean>
   */
  async initiatePasswordReset(email: string): Promise<boolean> {
    try {
      log(LogLevel.INFO, "Initiating password reset", { email });

      const secretHash = this.generateSecretHash(email);
      const command = new ForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await this.client.send(command);

      log(LogLevel.INFO, "Password reset initiated", { email });
      return true;
    } catch (error: any) {
      log(LogLevel.ERROR, "Password reset initiation failed", {
        email,
        error: error.message,
        errorCode: error.name,
      });
      return false;
    }
  }

  /**
   * Confirms password reset with verification code
   * @param email - User email
   * @param confirmationCode - Verification code
   * @param newPassword - New password
   * @returns Promise<boolean>
   */
  async confirmPasswordReset(
    email: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      log(LogLevel.INFO, "Confirming password reset", { email });

      const secretHash = this.generateSecretHash(email);
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await this.client.send(command);

      log(LogLevel.INFO, "Password reset confirmed", { email });
      return true;
    } catch (error: any) {
      log(LogLevel.ERROR, "Password reset confirmation failed", {
        email,
        error: error.message,
        errorCode: error.name,
      });
      return false;
    }
  }

  // ============= Error Handling =============

  private handleCognitoError(
    error: any,
    defaultMessage: string
  ): UserRegistrationResponse {
    switch (error.name) {
      case "UsernameExistsException":
        return {
          success: false,
          message:
            "An account with this email already exists. Please try logging in instead.",
        };
      case "InvalidPasswordException":
        return {
          success: false,
          message:
            "Password does not meet security requirements. Please ensure it has at least 12 characters with uppercase, lowercase, number, and special character.",
        };
      case "InvalidParameterException":
        return {
          success: false,
          message:
            "Invalid input provided. Please check your information and try again.",
        };
      case "TooManyRequestsException":
        return {
          success: false,
          message: "Too many requests. Please wait a moment and try again.",
        };
      default:
        return {
          success: false,
          message: defaultMessage,
        };
    }
  }

  private handleAuthError(error: any): UserLoginResponse {
    switch (error.name) {
      case "NotAuthorizedException":
        return {
          success: false,
          message:
            "Invalid email or password. Please check your credentials and try again.",
        };
      case "UserNotConfirmedException":
        return {
          success: false,
          message:
            "Please verify your email address before logging in. Check your inbox for the verification link.",
        };
      case "UserNotFoundException":
        return {
          success: false,
          message:
            "No account found with this email address. Please check your email or sign up for a new account.",
        };
      case "TooManyRequestsException":
        return {
          success: false,
          message:
            "Too many login attempts. Please wait a moment and try again.",
        };
      case "PasswordResetRequiredException":
        return {
          success: false,
          message:
            "Password reset required. Please reset your password to continue.",
        };
      default:
        return {
          success: false,
          message: "Authentication failed. Please try again.",
        };
    }
  }

  private getChallengeMessage(challengeName: string): string {
    switch (challengeName) {
      case "NEW_PASSWORD_REQUIRED":
        return "New password required. Please set a new password.";
      case "SMS_MFA":
        return "SMS verification required. Please enter the code sent to your phone.";
      case "SOFTWARE_TOKEN_MFA":
        return "Multi-factor authentication required. Please enter your authenticator code.";
      default:
        return "Additional verification required to complete login.";
    }
  }
}
