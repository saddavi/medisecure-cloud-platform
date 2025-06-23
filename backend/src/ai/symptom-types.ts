/**
 * TypeScript interfaces and types for AI-powered symptom analysis
 * MediSecure Cloud Platform - Qatar Healthcare System
 */

// ============= Core Symptom Analysis Types =============

export interface SymptomInput {
  description: string;
  severity?: number; // 1-10 scale
  duration?: string; // e.g., "2 days", "1 week"
  location?: string; // body part/location
  triggers?: string[]; // what makes it worse/better
  associatedSymptoms?: string[];
  language: "en" | "ar";
}

export interface PatientContext {
  sessionId?: string; // for anonymous sessions
  patientId?: string; // for registered patients
  age?: number;
  gender?: "male" | "female";
  medicalHistory?: MedicalCondition[];
  medications?: Medication[];
  allergies?: string[];
  culturalPreferences?: CulturalPreferences;
  emergencyContact?: EmergencyContact;
}

export interface MedicalCondition {
  condition: string;
  diagnosedDate?: string;
  severity: "mild" | "moderate" | "severe";
  isActive: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  isActive: boolean;
}

export interface CulturalPreferences {
  preferredLanguage: "en" | "ar";
  religiousConsiderations?: string[];
  dietaryRestrictions?: string[];
  genderPreferenceForProvider?: "male" | "female" | "no-preference";
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  isEmergencyService?: boolean; // for 999, etc.
}

// ============= AI Response Types =============

export interface AISymptomAnalysis {
  analysis: string;
  severity: SymptomSeverity;
  urgencyScore: number; // 1-10
  recommendations: HealthRecommendations;
  followUpQuestions: string[];
  culturalConsiderations?: string[];
  emergencyWarning?: string;
  confidenceScore: number; // 0-1, AI confidence in analysis
  language: "en" | "ar";
  timestamp: Date;
  sessionId: string;
}

export type SymptomSeverity = "Low" | "Medium" | "High" | "Emergency";

export interface HealthRecommendations {
  action: RecommendedAction;
  timeframe: string;
  specialist?: MedicalSpecialty;
  selfCareInstructions?: string[];
  medications?: OverTheCounterRecommendation[];
  lifestyle?: LifestyleRecommendation[];
  redFlags?: string[]; // warning signs to watch for
}

export type RecommendedAction =
  | "self-care"
  | "appointment"
  | "urgent-care"
  | "emergency"
  | "telemedicine"
  | "specialist-referral";

export type MedicalSpecialty =
  | "family-medicine"
  | "internal-medicine"
  | "cardiology"
  | "dermatology"
  | "orthopedics"
  | "neurology"
  | "psychiatry"
  | "pediatrics"
  | "gynecology"
  | "emergency-medicine"
  | "gastroenterology"
  | "pulmonology"
  | "endocrinology"
  | "ophthalmology"
  | "ent" // ear, nose, throat
  | "urology";

export interface OverTheCounterRecommendation {
  medication: string;
  dosage: string;
  duration: string;
  warnings?: string[];
  islamicCompliance?: boolean; // for Qatar/Islamic considerations
}

export interface LifestyleRecommendation {
  category: "diet" | "exercise" | "sleep" | "stress" | "hydration" | "other";
  recommendation: string;
  culturalAdaptation?: string; // Qatar-specific adaptations
}

// ============= Anonymous Session Types =============

export interface AnonymousSession {
  sessionId: string;
  symptoms: SymptomInput[];
  aiAnalysis?: AISymptomAnalysis;
  language: "en" | "ar";
  createdAt: Date;
  expiresAt: Date; // TTL for cleanup
  ipAddress?: string; // for rate limiting
  userAgent?: string;
  convertedToPatient?: boolean;
}

export interface AnonymousSymptomResponse {
  analysis: string;
  severity: SymptomSeverity;
  urgencyScore: number;
  recommendations: {
    action: RecommendedAction;
    timeframe: string;
  };
  generalAdvice: string;
  whenToSeekHelp: string;
  registrationPrompt: string;
  sessionId: string;
  language: "en" | "ar";
  emergencyWarning?: string; // Optional emergency warning
}

// ============= Qatar-Specific Healthcare Types =============

export interface QatarHealthcareProvider {
  name: string;
  type: "hospital" | "clinic" | "emergency" | "specialist";
  location: QatarLocation;
  services: MedicalSpecialty[];
  emergencyCapable: boolean;
  acceptsInsurance: string[];
  contactInfo: {
    phone: string;
    address: string;
    website?: string;
  };
  languages: ("en" | "ar")[];
}

export type QatarLocation =
  | "doha-city"
  | "west-bay"
  | "al-rayyan"
  | "al-wakrah"
  | "al-khor"
  | "dukhan"
  | "mesaieed"
  | "other";

// ============= Emergency Response Types =============

export interface EmergencyAssessment {
  isEmergency: boolean;
  urgencyLevel: "Critical" | "High" | "Medium" | "Low";
  immediateActions: string[];
  emergencyContacts: QatarEmergencyContact[];
  transportAdvice: string;
  language: "en" | "ar";
}

export interface QatarEmergencyContact {
  name: string;
  number: string;
  type: "ambulance" | "police" | "fire" | "poison-control" | "hospital";
  description: string;
  language: "en" | "ar" | "both";
}

// ============= DynamoDB Schema Types =============

export interface SymptomAnalysisRecord {
  PK: string; // "PATIENT#{patientId}" or "ANONYMOUS_SESSION#{sessionId}"
  SK: string; // "SYMPTOM_CHECK#{timestamp}"
  GSI1PK?: string; // "SYMPTOM_CHECKS" for querying
  GSI1SK?: string; // timestamp for sorting

  // Data fields
  symptoms: SymptomInput[];
  aiAnalysis: AISymptomAnalysis;
  patientContext?: PatientContext;
  isAnonymous: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  ttl?: number; // for anonymous sessions

  // Qatar-specific
  location?: QatarLocation;
  culturalContext?: "qatar" | "gulf" | "general";
}

// ============= API Request/Response Types =============

export interface AnalyzeSymptomRequest {
  symptoms: SymptomInput;
  patientContext?: Partial<PatientContext>;
  isAnonymous?: boolean;
  language: "en" | "ar";
}

export interface AnalyzeSymptomResponse {
  success: boolean;
  data?: AISymptomAnalysis | AnonymousSymptomResponse;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  sessionId: string;
  rateLimit?: {
    remaining: number;
    resetTime: Date;
  };
}

export interface GetSymptomHistoryRequest {
  patientId?: string;
  sessionId?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetSymptomHistoryResponse {
  success: boolean;
  data?: SymptomAnalysisRecord[];
  pagination?: {
    hasMore: boolean;
    nextToken?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============= Utility Types =============

export interface AIModelConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
  region: string;
  costPerToken: number;
}

export interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxTokensPerHour: number;
  anonymousLimits: {
    maxRequestsPerHour: number;
    maxRequestsPerIP: number;
  };
}

// ============= Validation Schemas =============

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export const SYMPTOM_SEVERITIES = [
  "Low",
  "Medium",
  "High",
  "Emergency",
] as const;
export const RECOMMENDED_ACTIONS = [
  "self-care",
  "appointment",
  "urgent-care",
  "emergency",
  "telemedicine",
  "specialist-referral",
] as const;
export const QATAR_LOCATIONS = [
  "doha-city",
  "west-bay",
  "al-rayyan",
  "al-wakrah",
  "al-khor",
  "dukhan",
  "mesaieed",
  "other",
] as const;

// ============= Constants =============

export const QATAR_EMERGENCY_CONTACTS: QatarEmergencyContact[] = [
  {
    name: "Emergency Services",
    number: "999",
    type: "ambulance",
    description: "All emergency services",
    language: "both",
  },
  {
    name: "Hamad Medical Corporation",
    number: "+974 4439 4444",
    type: "hospital",
    description: "Main public hospital system",
    language: "both",
  },
  {
    name: "Qatar Red Crescent",
    number: "+974 4442 2222",
    type: "ambulance",
    description: "Emergency medical services",
    language: "both",
  },
  {
    name: "Poison Control",
    number: "+974 4439 9999",
    type: "poison-control",
    description: "Poison control and drug information",
    language: "both",
  },
];

export const AI_MODEL_CONFIGS: Record<string, AIModelConfig> = {
  "claude-3-haiku": {
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    maxTokens: 1000,
    temperature: 0.3,
    region: "us-east-1",
    costPerToken: 0.00025, // USD per 1K tokens
  },
  "claude-3-sonnet": {
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    maxTokens: 1000,
    temperature: 0.3,
    region: "us-east-1",
    costPerToken: 0.003, // USD per 1K tokens
  },
};

export default {
  SUPPORTED_LANGUAGES,
  SYMPTOM_SEVERITIES,
  RECOMMENDED_ACTIONS,
  QATAR_LOCATIONS,
  QATAR_EMERGENCY_CONTACTS,
  AI_MODEL_CONFIGS,
};
