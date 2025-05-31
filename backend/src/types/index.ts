// MediSecure Cloud Platform - Type Definitions
// Healthcare-grade type safety for patient data protection

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// ============= AWS Lambda Types =============
export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

// ============= User Management Types =============
export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  userId?: string;
  verificationRequired?: boolean;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}

// ============= Healthcare-Specific Types =============
export interface PatientProfile {
  userId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

// ============= Error Types =============
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface MediSecureError {
  code: ErrorCodes;
  message: string;
  details?: any;
  timestamp: string;
}

// ============= Configuration Types =============
export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
  region: string;
}

export interface AppConfig {
  cognito: CognitoConfig;
  environment: 'development' | 'staging' | 'production';
  region: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ============= Validation Schemas =============
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
