// MediSecure Cloud Platform - Type Definitions
// Healthcare-grade type safety for frontend application

// ============= Authentication Types =============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType?: "PATIENT" | "DOCTOR" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: string | null;
}

// ============= Patient Management Types =============
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Changed from phoneNumber to match usage
  phoneNumber?: string; // Keep for compatibility
  dateOfBirth?: string;
  gender?: "M" | "F" | "O";
  address: {
    // Made required for form
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    zipCode: string; // Added for compatibility
  };
}

export interface MedicalInfo {
  bloodType?: string;
  allergies: string[]; // Made required for form
  medications: string[]; // Made required for form
  medicalHistory?: string; // Added for compatibility
  emergencyContact: {
    // Made required for form
    name: string;
    relationship: string;
    phoneNumber: string;
    phone: string; // Added for compatibility
  };
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface PatientPreferences {
  language?: string;
  timezone?: string;
  communicationMethod?: "email" | "sms" | "both";
}

export interface Patient {
  id: string; // Added for compatibility
  patientId: string;
  personalInfo: PersonalInfo;
  medicalInfo?: MedicalInfo;
  preferences?: PatientPreferences;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  personalInfo: PersonalInfo;
  medicalInfo: MedicalInfo; // Made required for form
  preferences?: PatientPreferences;
}

export interface UpdatePatientRequest {
  personalInfo?: Partial<PersonalInfo>;
  medicalInfo?: Partial<MedicalInfo>;
  preferences?: Partial<PatientPreferences>;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
}

// Form-specific interface for edit page (all properties defined for form state)
export interface UpdatePatientFormData {
  personalInfo: PersonalInfo;
  medicalInfo: MedicalInfo;
  preferences?: PatientPreferences;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    hasMore: boolean;
    lastKey: string | null;
  };
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: {
    total: number;
    hasMore: boolean;
    lastKey: string | null;
  };
}

// ============= Form Types =============
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  acceptTerms: boolean;
}

export interface PatientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: "M" | "F" | "O";

  // Address
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Medical Information
  bloodType?: string;
  allergies?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // Insurance
  insuranceProvider?: string;
  insuranceNumber?: string;

  // Preferences
  language?: string;
  communicationMethod?: "email" | "sms" | "both";
}

// ============= UI State Types =============
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: "create" | "edit" | "view" | "delete";
  data?: any;
}

// ============= Navigation Types =============
export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  roles: UserRole[];
  requiresAuth: boolean;
}

// ============= Healthcare Specific Types =============
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Gender = "M" | "F" | "O";

export type PatientStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type CommunicationMethod = "email" | "sms" | "both";

// ============= Error Types =============
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ============= Component Props Types =============
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface SearchFilters {
  query?: string;
  status?: PatientStatus;
  dateRange?: {
    start: string;
    end: string;
  };
}
