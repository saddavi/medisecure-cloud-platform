// MediSecure Cloud Platform - Healthcare Audit Logger
// HIPAA & Qatar Healthcare Regulation Compliance

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

// ============= Audit Event Types =============
export enum AuditAction {
  // Authentication Events
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTRATION = "USER_REGISTRATION",
  PASSWORD_RESET = "PASSWORD_RESET",

  // Data Access Events
  PATIENT_PROFILE_VIEW = "PATIENT_PROFILE_VIEW",
  PATIENT_PROFILE_UPDATE = "PATIENT_PROFILE_UPDATE",
  MEDICAL_RECORD_VIEW = "MEDICAL_RECORD_VIEW",
  MEDICAL_RECORD_CREATE = "MEDICAL_RECORD_CREATE",
  MEDICAL_RECORD_UPDATE = "MEDICAL_RECORD_UPDATE",
  MEDICAL_RECORD_DELETE = "MEDICAL_RECORD_DELETE",

  // Administrative Events
  USER_ROLE_CHANGE = "USER_ROLE_CHANGE",
  SYSTEM_CONFIGURATION = "SYSTEM_CONFIGURATION",
  EXPORT_PATIENT_DATA = "EXPORT_PATIENT_DATA",

  // Security Events
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  FAILED_LOGIN = "FAILED_LOGIN",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
}

export enum AuditResult {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  UNAUTHORIZED = "UNAUTHORIZED",
  ERROR = "ERROR",
}

export interface AuditEvent {
  // Primary identifiers
  action: AuditAction;
  result: AuditResult;
  timestamp: string;

  // User context
  userId?: string;
  userEmail?: string;
  userRole?: string;
  cognitoUserId?: string;

  // Resource context
  resourceType?: string;
  resourceId?: string;
  patientId?: string;

  // Technical context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;

  // Gulf/Qatar specific
  location?: string;
  facilityId?: string;

  // Security context
  authMethod?: string;
  errorCode?: string;
  errorMessage?: string;

  // Data changes (for updates)
  oldData?: any;
  newData?: any;

  // Compliance fields
  dataClassification?: "PUBLIC" | "CONFIDENTIAL" | "RESTRICTED" | "MEDICAL";
  retentionPeriod?: string; // e.g., "7_YEARS" for medical records
}

// ============= Audit Logger Class =============
export class HealthcareAuditLogger {
  private dynamoClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "me-south-1", // Bahrain for Gulf region
    });
    this.dynamoClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_TABLE_NAME || "MediSecure-HealthData";
  }

  /**
   * Log an audit event with healthcare compliance standards
   * @param event Audit event to log
   * @param apiEvent Optional API Gateway event for automatic context extraction
   */
  async logAuditEvent(
    event: Partial<AuditEvent>,
    apiEvent?: APIGatewayProxyEvent
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const auditId = `audit_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Extract context from API Gateway event if provided
      const context = apiEvent ? this.extractContextFromApiEvent(apiEvent) : {};

      const auditRecord = {
        // DynamoDB keys for audit data
        PK: `AUDIT#${timestamp.split("T")[0]}`, // Partition by date
        SK: `${timestamp}#${event.action}#${auditId}`,

        // GSI keys for querying
        GSI1PK: event.userId ? `USER#${event.userId}` : "SYSTEM",
        GSI1SK: `AUDIT#${timestamp}`,
        GSI2PK: event.resourceType
          ? `RESOURCE#${event.resourceType}`
          : "GENERAL",
        GSI2SK: `AUDIT#${timestamp}`,

        // Entity metadata
        entityType: "AUDIT",
        auditId,

        // Required audit fields
        action: event.action,
        result: event.result || AuditResult.SUCCESS,
        timestamp,

        // User context
        userId: event.userId,
        userEmail: event.userEmail,
        userRole: event.userRole,
        cognitoUserId: event.cognitoUserId,

        // Resource context
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        patientId: event.patientId,

        // Technical context (merged with API Gateway context)
        ...context,
        requestId: event.requestId || context.requestId,

        // Gulf/Qatar specific
        location: event.location || "Qatar", // Default to Qatar
        facilityId: event.facilityId,

        // Security context
        authMethod: event.authMethod,
        errorCode: event.errorCode,
        errorMessage: event.errorMessage,

        // Data changes (only store if provided)
        ...(event.oldData && { oldData: event.oldData }),
        ...(event.newData && { newData: event.newData }),

        // Compliance fields
        dataClassification: event.dataClassification || "CONFIDENTIAL",
        retentionPeriod: event.retentionPeriod || "7_YEARS", // HIPAA requirement

        // Metadata for analytics
        createdAt: timestamp,
        ttl: this.calculateTTL(event.retentionPeriod || "7_YEARS"), // Auto-cleanup
      };

      // Store in DynamoDB
      await this.dynamoClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: auditRecord,
        })
      );

      console.log(`✅ Audit event logged: ${event.action} - ${event.result}`, {
        auditId,
        userId: event.userId,
        action: event.action,
        timestamp,
      });
    } catch (error) {
      // CRITICAL: Never let audit failures break the main application
      console.error("❌ Audit logging failed:", error);

      // Fallback: Log to CloudWatch as backup
      console.log(
        "AUDIT_FALLBACK:",
        JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    }
  }

  /**
   * Extract context information from API Gateway event
   */
  private extractContextFromApiEvent(
    event: APIGatewayProxyEvent
  ): Partial<AuditEvent> {
    return {
      ipAddress: event.requestContext?.identity?.sourceIp,
      userAgent: event.headers?.["User-Agent"] || event.headers?.["user-agent"],
      requestId: event.requestContext?.requestId,

      // Extract session info from headers if available
      sessionId:
        event.headers?.["X-Session-ID"] || event.headers?.["x-session-id"],

      // Extract auth method from context
      authMethod: event.requestContext?.authorizer ? "COGNITO_JWT" : "NONE",
    };
  }

  /**
   * Calculate TTL timestamp for automatic record cleanup
   */
  private calculateTTL(retentionPeriod: string): number {
    const now = new Date();

    switch (retentionPeriod) {
      case "1_YEAR":
        return Math.floor(now.setFullYear(now.getFullYear() + 1) / 1000);
      case "3_YEARS":
        return Math.floor(now.setFullYear(now.getFullYear() + 3) / 1000);
      case "7_YEARS": // HIPAA standard
        return Math.floor(now.setFullYear(now.getFullYear() + 7) / 1000);
      case "PERMANENT":
        return 0; // No TTL
      default:
        return Math.floor(now.setFullYear(now.getFullYear() + 7) / 1000);
    }
  }

  /**
   * Qatar-specific convenience methods for common audit scenarios
   */

  /**
   * Log patient data access (Qatar healthcare regulation requirement)
   */
  async logPatientDataAccess(
    patientId: string,
    userId: string,
    action: AuditAction,
    apiEvent?: APIGatewayProxyEvent
  ): Promise<void> {
    await this.logAuditEvent(
      {
        action,
        result: AuditResult.SUCCESS,
        userId,
        patientId,
        resourceType: "PATIENT_DATA",
        resourceId: patientId,
        dataClassification: "MEDICAL",
        location: "Qatar",
      },
      apiEvent
    );
  }

  /**
   * Log authentication events for security monitoring
   */
  async logAuthEvent(
    action: AuditAction,
    userId: string,
    result: AuditResult,
    errorCode?: string,
    apiEvent?: APIGatewayProxyEvent
  ): Promise<void> {
    await this.logAuditEvent(
      {
        action,
        result,
        userId,
        errorCode,
        resourceType: "AUTHENTICATION",
        dataClassification: "CONFIDENTIAL",
      },
      apiEvent
    );
  }

  /**
   * Log administrative actions for compliance
   */
  async logAdminAction(
    action: AuditAction,
    adminUserId: string,
    targetResourceId: string,
    oldData?: any,
    newData?: any,
    apiEvent?: APIGatewayProxyEvent
  ): Promise<void> {
    await this.logAuditEvent(
      {
        action,
        result: AuditResult.SUCCESS,
        userId: adminUserId,
        resourceType: "SYSTEM",
        resourceId: targetResourceId,
        oldData,
        newData,
        dataClassification: "RESTRICTED",
      },
      apiEvent
    );
  }
}

// ============= Global Instance =============
export const auditLogger = new HealthcareAuditLogger();

// ============= Convenience Functions =============

/**
 * Quick audit logging for Lambda functions
 */
export const logAudit = (
  action: AuditAction,
  userId: string,
  details?: Partial<AuditEvent>
) => {
  return auditLogger.logAuditEvent({
    action,
    userId,
    result: AuditResult.SUCCESS,
    ...details,
  });
};

/**
 * Log failed operations for security monitoring
 */
export const logAuditFailure = (
  action: AuditAction,
  userId: string,
  errorCode: string,
  errorMessage: string,
  details?: Partial<AuditEvent>
) => {
  return auditLogger.logAuditEvent({
    action,
    userId,
    result: AuditResult.FAILURE,
    errorCode,
    errorMessage,
    ...details,
  });
};
