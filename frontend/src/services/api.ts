// MediSecure Cloud Platform - API Service
// Healthcare-grade API client with AWS integration

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { awsConfig } from "@/config/aws";
import { AuthTokens, ApiResponse } from "@/types";

class ApiService {
  private client: AxiosInstance;
  private authTokens: AuthTokens | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: awsConfig.apiGateway.baseUrl,
      timeout: 30000, // 30 second timeout for healthcare APIs
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        if (this.authTokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.authTokens.accessToken}`;
        }

        // Add request ID for tracing
        config.headers["X-Request-ID"] = this.generateRequestId();

        console.log(
          `🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      async (error: AxiosError) => {
        console.error(
          `❌ API Error: ${error.response?.status} ${error.config?.url}`,
          error.response?.data
        );

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401) {
          this.handleAuthError();
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatError(error: AxiosError): ApiResponse {
    const response = error.response?.data as any;

    return {
      success: false,
      message:
        response?.message || error.message || "An unexpected error occurred",
      error: response?.error || "API_ERROR",
      timestamp: new Date().toISOString(),
    };
  }

  private handleAuthError() {
    // Clear stored tokens
    this.authTokens = null;
    localStorage.removeItem("medisecure_tokens");

    // Redirect to login
    window.location.href = "/login";
  }

  // ============= Authentication Methods =============

  setAuthTokens(tokens: AuthTokens) {
    this.authTokens = tokens;
    localStorage.setItem("medisecure_tokens", JSON.stringify(tokens));
  }

  clearAuthTokens() {
    this.authTokens = null;
    localStorage.removeItem("medisecure_tokens");
  }

  loadStoredTokens() {
    try {
      const stored = localStorage.getItem("medisecure_tokens");
      if (stored) {
        this.authTokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load stored tokens:", error);
      this.clearAuthTokens();
    }
  }

  // ============= Authentication API =============

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post(
      awsConfig.apiGateway.endpoints.auth.register,
      userData
    );
    return response.data;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthTokens>> {
    const response = await this.client.post(
      awsConfig.apiGateway.endpoints.auth.login,
      credentials
    );

    if (response.data.success && response.data.data) {
      this.setAuthTokens(response.data.data);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    this.clearAuthTokens();
  }

  // ============= Patient Management API =============

  async getPatients(params?: {
    limit?: number;
    lastKey?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    if (params?.lastKey) {
      queryParams.append("lastKey", params.lastKey);
    }

    const url = `${awsConfig.apiGateway.endpoints.patients.base}${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getPatient(patientId: string): Promise<ApiResponse> {
    const response = await this.client.get(
      awsConfig.apiGateway.endpoints.patients.byId(patientId)
    );
    return response.data;
  }

  async createPatient(patientData: {
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
  }): Promise<ApiResponse> {
    const response = await this.client.post(
      awsConfig.apiGateway.endpoints.patients.base,
      patientData
    );
    return response.data;
  }

  async updatePatient(
    patientId: string,
    updates: {
      personalInfo?: any;
      medicalInfo?: any;
      preferences?: any;
      status?: "ACTIVE" | "INACTIVE" | "PENDING";
    }
  ): Promise<ApiResponse> {
    const response = await this.client.put(
      awsConfig.apiGateway.endpoints.patients.byId(patientId),
      updates
    );
    return response.data;
  }

  // ============= Direct Client Access for Advanced Usage =============

  get httpClient() {
    return this.client;
  }

  // Generic HTTP methods for compatibility
  async get(url: string, config?: any) {
    const response = await this.client.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.client.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.client.put(url, data, config);
    return response;
  }

  async patch(url: string, data?: any, config?: any) {
    const response = await this.client.patch(url, data, config);
    return response;
  }

  async delete(url: string, config?: any) {
    const response = await this.client.delete(url, config);
    return response;
  }

  // ============= Health Check =============

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - you can enhance this
      await this.client.get("/health");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Load tokens on initialization
apiService.loadStoredTokens();

export default apiService;
