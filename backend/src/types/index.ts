// MediSecure Cloud Platform - Type Definitions
// Healthcare-grade type safety for patient data protection

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

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
  // DynamoDB Keys
  PK: string; // USER#{patientId}
  SK: string; // PROFILE#main
  GSI1PK: string; // USER#PATIENT (for listing all patients)
  GSI1SK: string; // {timestamp}#{patientId} (for sorting by creation time)

  // Entity metadata
  entityType: "USER";
  userType: "PATIENT" | "PROVIDER";
  patientId: string;
  cognitoUserId: string;

  // Personal information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: "M" | "F" | "O";
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };

  // Medical information
  medicalInfo: {
    bloodType?: string;
    allergies?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
    insuranceProvider?: string;
    insuranceNumber?: string;
    medicalConditions?: string[];
    medications?: string[];
  };

  // User preferences
  preferences: {
    language: string;
    timezone: string;
    communicationMethod: "email" | "sms" | "both";
  };

  // Timestamps and status
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface PatientCreateRequest {
  cognitoUserId?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: "M" | "F" | "O";
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    communicationMethod?: "email" | "sms" | "both";
  };
}

export interface PatientUpdateRequest {
  personalInfo?: Partial<PatientCreateRequest["personalInfo"]>;
  medicalInfo?: Partial<PatientCreateRequest["medicalInfo"]>;
  preferences?: Partial<PatientCreateRequest["preferences"]>;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

// ============= Medical Records Types =============
export interface MedicalRecord {
  // DynamoDB Keys
  PK: string; // USER#{patientId}
  SK: string; // RECORD#{recordId}#{timestamp}
  GSI1PK: string; // PROVIDER#{providerId}
  GSI1SK: string; // RECORD#{timestamp}
  GSI2PK: string; // RECORD_TYPE#{recordType}
  GSI2SK: string; // {timestamp}

  // Entity metadata
  entityType: "RECORD";
  recordType:
    | "CONSULTATION"
    | "DIAGNOSTIC"
    | "TREATMENT"
    | "FOLLOW_UP"
    | "EMERGENCY";
  recordId: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;

  // Visit information
  visitInfo: {
    date: string;
    type:
      | "REGULAR_CHECKUP"
      | "FOLLOW_UP"
      | "EMERGENCY"
      | "CONSULTATION"
      | "PROCEDURE";
    duration: number; // in minutes
    location: string;
  };

  // Clinical data
  clinicalData: {
    chiefComplaint?: string;
    symptoms?: string[];
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
      height?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
    };
    diagnosis?: Array<{
      code: string; // ICD-10 code
      description: string;
      severity?: "MILD" | "MODERATE" | "SEVERE";
    }>;
    treatment?: {
      prescription?: Array<{
        medication: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
      procedures?: Array<{
        name: string;
        description: string;
        date: string;
      }>;
      recommendations?: string[];
    };
  };

  // Follow-up information
  followUp: {
    required: boolean;
    timeframe?: string;
    notes?: string;
  };

  // Attachments (documents, images, etc.)
  attachments: Array<{
    documentId: string;
    type:
      | "ECG_REPORT"
      | "LAB_RESULT"
      | "X_RAY"
      | "MRI"
      | "CT_SCAN"
      | "PRESCRIPTION"
      | "OTHER";
    s3Key: string;
  }>;

  // Timestamps and status
  createdAt: string;
  updatedAt: string;
  status: "DRAFT" | "COMPLETED" | "REVIEWED" | "ARCHIVED";
}

export interface MedicalRecordCreateRequest {
  recordType: MedicalRecord["recordType"];
  providerId: string;
  appointmentId?: string;
  visitInfo: {
    date?: string;
    type: MedicalRecord["visitInfo"]["type"];
    duration?: number;
    location: string;
  };
  clinicalData: MedicalRecord["clinicalData"];
  followUp?: MedicalRecord["followUp"];
  attachments?: MedicalRecord["attachments"];
}

export interface MedicalRecordUpdateRequest {
  clinicalData?: Partial<MedicalRecord["clinicalData"]>;
  followUp?: Partial<MedicalRecord["followUp"]>;
  attachments?: MedicalRecord["attachments"];
  status?: MedicalRecord["status"];
}

// ============= Appointment Types =============
export interface Appointment {
  // DynamoDB Keys
  PK: string; // USER#{patientId}
  SK: string; // APPOINTMENT#{appointmentId}#{timestamp}
  GSI1PK: string; // PROVIDER#{providerId}
  GSI1SK: string; // APPOINTMENT#{timestamp}
  GSI2PK: string; // APPOINTMENT_DATE#{date}
  GSI2SK: string; // {time}#{appointmentId}

  // Entity metadata
  entityType: "APPOINTMENT";
  appointmentId: string;
  patientId: string;
  providerId: string;

  // Scheduling information
  schedulingInfo: {
    appointmentDate: string;
    duration: number; // in minutes
    type: "CONSULTATION" | "FOLLOW_UP" | "PROCEDURE" | "EMERGENCY";
    location: string;
    mode: "IN_PERSON" | "TELEMEDICINE" | "PHONE";
  };

  reason: string;
  preparation?: string[];

  // Reminder system
  reminder: {
    sent: boolean;
    scheduledFor: string;
  };

  // Payment information
  payment: {
    fee: number;
    currency: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    method: "CASH" | "CARD" | "INSURANCE" | "BANK_TRANSFER";
  };

  // Timestamps and status
  createdAt: string;
  updatedAt: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
}

// ============= Document Types =============
export interface MedicalDocument {
  // DynamoDB Keys
  PK: string; // USER#{patientId}
  SK: string; // DOCUMENT#{documentId}#{timestamp}
  GSI1PK: string; // DOCUMENT_TYPE#{type}
  GSI1SK: string; // {timestamp}

  // Entity metadata
  entityType: "DOCUMENT";
  documentId: string;
  patientId: string;
  providerId: string;
  recordId?: string;

  // Document information
  documentInfo: {
    type:
      | "ECG_REPORT"
      | "LAB_RESULT"
      | "X_RAY"
      | "MRI"
      | "CT_SCAN"
      | "PRESCRIPTION"
      | "INSURANCE"
      | "OTHER";
    title: string;
    description: string;
    category:
      | "DIAGNOSTIC_REPORT"
      | "PRESCRIPTION"
      | "INSURANCE_DOC"
      | "CONSENT_FORM"
      | "OTHER";
  };

  // File information
  fileInfo: {
    s3Bucket: string;
    s3Key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    checksum: string;
  };

  // Security and compliance
  security: {
    encryptionStatus: "ENCRYPTED" | "PENDING" | "FAILED";
    accessLevel: "PATIENT_ONLY" | "PATIENT_PROVIDER_ONLY" | "FULL_ACCESS";
    retentionPeriod: "1_YEAR" | "7_YEARS" | "INDEFINITE";
  };

  // Timestamps and status
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
}

// ============= Previously defined types remain unchanged =============
// PatientProfile interface already exists above - removing duplicate
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
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  USER_EXISTS = "USER_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
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
  environment: "development" | "staging" | "production";
  region: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

// ============= Validation Schemas =============
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
