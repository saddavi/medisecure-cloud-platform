// MediSecure Cloud Platform - AWS Amplify Authentication Service
// Healthcare-grade authentication service using AWS Cognito

import { Amplify } from "aws-amplify";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import { amplifyConfig } from "@/config/aws";
import { AuthTokens, AuthUser, LoginCredentials, RegisterData } from "@/types";

// Configure Amplify
Amplify.configure(amplifyConfig);

export class AmplifyAuthService {
  private static instance: AmplifyAuthService;

  private constructor() {}

  public static getInstance(): AmplifyAuthService {
    if (!AmplifyAuthService.instance) {
      AmplifyAuthService.instance = new AmplifyAuthService();
    }
    return AmplifyAuthService.instance;
  }

  // ============= Authentication Methods =============

  /**
   * Register a new user with AWS Cognito
   */
  async register(userData: RegisterData): Promise<{
    success: boolean;
    message: string;
    userId?: string;
    nextStep?: string;
  }> {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            given_name: userData.firstName,
            family_name: userData.lastName,
            phone_number: userData.phoneNumber || "",
          },
          autoSignIn: true,
        },
      });

      return {
        success: true,
        message: isSignUpComplete
          ? "Registration successful! You can now sign in."
          : "Registration successful! Please check your email for verification.",
        userId,
        nextStep: nextStep.signUpStep,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Confirm user registration with verification code
   */
  async confirmRegistration(
    email: string,
    confirmationCode: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      return {
        success: true,
        message: "Email verified successfully! You can now sign in.",
      };
    } catch (error: any) {
      console.error("Confirmation error:", error);
      return {
        success: false,
        message: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Resend verification code
   */
  async resendConfirmationCode(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await resendSignUpCode({
        username: email,
      });

      return {
        success: true,
        message: "Verification code sent! Please check your email.",
      };
    } catch (error: any) {
      console.error("Resend code error:", error);
      return {
        success: false,
        message: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Sign in user with AWS Cognito
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    message: string;
    user?: AuthUser;
    tokens?: AuthTokens;
  }> {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (isSignedIn) {
        const user = await this.getCurrentUser();
        const tokens = await this.getTokens();

        return {
          success: true,
          message: "Login successful!",
          user: user || undefined,
          tokens: tokens || undefined,
        };
      } else {
        return {
          success: false,
          message: `Additional step required: ${nextStep.signInStep}`,
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await signOut();
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser();

      return {
        userId: user.userId,
        email: user.signInDetails?.loginId || "",
        firstName: "", // Will be populated from user attributes if needed
        lastName: "",
        userType: "PATIENT", // Default type
        isEmailVerified: true, // Assume verified if authenticated
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  /**
   * Get authentication tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const session = await fetchAuthSession();

      if (session.tokens) {
        return {
          accessToken: session.tokens.accessToken.toString(),
          refreshToken: "", // Refresh token not directly accessible in Amplify v6
          idToken: session.tokens.idToken?.toString() || "",
          expiresIn: Math.floor(Date.now() / 1000) + 3600, // Default 1 hour
        };
      }

      return null;
    } catch (error) {
      console.error("Get tokens error:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(): Promise<AuthTokens | null> {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });

      if (session.tokens) {
        return {
          accessToken: session.tokens.accessToken.toString(),
          refreshToken: "", // Refresh token not directly accessible in Amplify v6
          idToken: session.tokens.idToken?.toString() || "",
          expiresIn: Math.floor(Date.now() / 1000) + 3600, // Default 1 hour
        };
      }

      return null;
    } catch (error) {
      console.error("Refresh session error:", error);
      return null;
    }
  }

  // ============= Helper Methods =============

  /**
   * Format Cognito error messages for user display
   */
  private formatErrorMessage(error: any): string {
    switch (error.name) {
      case "UserNotFoundException":
        return "No account found with this email address. Please check your email or sign up for a new account.";
      case "NotAuthorizedException":
        return "Incorrect email or password. Please try again.";
      case "UserNotConfirmedException":
        return "Please verify your email address before signing in.";
      case "InvalidPasswordException":
        return "Password does not meet requirements. Please choose a stronger password.";
      case "UsernameExistsException":
        return "An account with this email already exists. Please sign in instead.";
      case "CodeMismatchException":
        return "Invalid verification code. Please try again.";
      case "ExpiredCodeException":
        return "Verification code has expired. Please request a new one.";
      case "LimitExceededException":
        return "Too many attempts. Please try again later.";
      case "TooManyRequestsException":
        return "Too many requests. Please wait before trying again.";
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  }
}

// Export singleton instance
export const amplifyAuthService = AmplifyAuthService.getInstance();
