// MediSecure Cloud Platform - Patient Management Lambda
// Healthcare-grade patient data management with HIPAA compliance

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createResponse, validateRequest } from "../utils/response";
import {
  PatientProfile,
  PatientCreateRequest,
  PatientUpdateRequest,
} from "../types";

// ============= AWS SDK Configuration =============
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

// ============= Patient Management Handler =============
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Patient Management Request:", JSON.stringify(event, null, 2));

    const { httpMethod, pathParameters, body } = event;
    const patientId = pathParameters?.patientId;

    switch (httpMethod) {
      case "GET":
        if (patientId) {
          return await getPatient(patientId);
        } else {
          return await listPatients(event);
        }

      case "POST":
        return await createPatient(body);

      case "PUT":
        if (!patientId) {
          return createResponse(
            400,
            false,
            "Patient ID is required for updates"
          );
        }
        return await updatePatient(patientId, body);

      default:
        return createResponse(405, false, "Method not allowed");
    }
  } catch (error) {
    console.error("Patient Management Error:", error);
    return createResponse(
      500,
      false,
      "Internal server error",
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
};

// ============= Patient Operations =============

/**
 * Get patient profile by ID
 */
async function getPatient(patientId: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${patientId}`,
        SK: "PROFILE#main",
      },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return createResponse(404, false, "Patient not found");
    }

    // Remove internal fields before returning
    const patientData = {
      patientId: result.Item.patientId,
      personalInfo: result.Item.personalInfo,
      medicalInfo: result.Item.medicalInfo,
      preferences: result.Item.preferences,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,
      status: result.Item.status,
    };

    return createResponse(
      200,
      true,
      "Patient retrieved successfully",
      patientData
    );
  } catch (error) {
    console.error("Get Patient Error:", error);
    return createResponse(500, false, "Failed to retrieve patient");
  }
}

/**
 * List patients with pagination (for healthcare providers)
 */
async function listPatients(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit || "20");
    const lastEvaluatedKey = queryParams.lastKey
      ? JSON.parse(decodeURIComponent(queryParams.lastKey))
      : undefined;

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1-Email-Index",
      KeyConditionExpression: "GSI1PK = :entityType",
      ExpressionAttributeValues: {
        ":entityType": "USER#PATIENT",
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await docClient.send(command);

    const patients =
      result.Items?.map((item) => ({
        patientId: item.patientId,
        personalInfo: {
          firstName: item.personalInfo?.firstName,
          lastName: item.personalInfo?.lastName,
          email: item.personalInfo?.email,
          dateOfBirth: item.personalInfo?.dateOfBirth,
        },
        status: item.status,
        createdAt: item.createdAt,
      })) || [];

    const response = {
      patients,
      pagination: {
        total: result.Count || 0,
        hasMore: !!result.LastEvaluatedKey,
        lastKey: result.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
          : null,
      },
    };

    return createResponse(
      200,
      true,
      "Patients retrieved successfully",
      response
    );
  } catch (error) {
    console.error("List Patients Error:", error);
    return createResponse(500, false, "Failed to retrieve patients");
  }
}

/**
 * Create new patient profile
 */
async function createPatient(
  requestBody: string | null
): Promise<APIGatewayProxyResult> {
  try {
    if (!requestBody) {
      return createResponse(400, false, "Request body is required");
    }

    const patientData: PatientCreateRequest = JSON.parse(requestBody);

    // Validate required fields
    if (
      !patientData.personalInfo?.email ||
      !patientData.personalInfo?.firstName ||
      !patientData.personalInfo?.lastName
    ) {
      return createResponse(
        400,
        false,
        "Email, first name, and last name are required"
      );
    }

    // Generate patient ID
    const patientId = `patient_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create patient record
    const patientRecord: PatientProfile = {
      PK: `USER#${patientId}`,
      SK: "PROFILE#main",
      GSI1PK: `EMAIL#${patientData.personalInfo.email}`,
      GSI1SK: `USER#${patientId}`,
      entityType: "USER",
      userType: "PATIENT",
      patientId,
      cognitoUserId: patientData.cognitoUserId || "",
      personalInfo: patientData.personalInfo,
      medicalInfo: patientData.medicalInfo || {},
      preferences: {
        language: patientData.preferences?.language || "en",
        timezone: patientData.preferences?.timezone || "Asia/Qatar",
        communicationMethod:
          patientData.preferences?.communicationMethod || "email",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "ACTIVE",
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: patientRecord,
      ConditionExpression: "attribute_not_exists(PK)", // Prevent duplicate creation
    });

    await docClient.send(command);

    // Return created patient data (without internal fields)
    const responseData = {
      patientId,
      personalInfo: patientRecord.personalInfo,
      medicalInfo: patientRecord.medicalInfo,
      preferences: patientRecord.preferences,
      createdAt: patientRecord.createdAt,
      status: patientRecord.status,
    };

    return createResponse(
      201,
      true,
      "Patient created successfully",
      responseData
    );
  } catch (error: any) {
    console.error("Create Patient Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return createResponse(409, false, "Patient already exists");
    }

    return createResponse(500, false, "Failed to create patient");
  }
}

/**
 * Update patient profile
 */
async function updatePatient(
  patientId: string,
  requestBody: string | null
): Promise<APIGatewayProxyResult> {
  try {
    if (!requestBody) {
      return createResponse(400, false, "Request body is required");
    }

    const updateData: PatientUpdateRequest = JSON.parse(requestBody);
    const timestamp = new Date().toISOString();

    // Build update expression dynamically
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues: any = {
      ":updatedAt": timestamp,
    };

    if (updateData.personalInfo) {
      updateExpression += ", personalInfo = :personalInfo";
      expressionAttributeValues[":personalInfo"] = updateData.personalInfo;
    }

    if (updateData.medicalInfo) {
      updateExpression += ", medicalInfo = :medicalInfo";
      expressionAttributeValues[":medicalInfo"] = updateData.medicalInfo;
    }

    if (updateData.preferences) {
      updateExpression += ", preferences = :preferences";
      expressionAttributeValues[":preferences"] = updateData.preferences;
    }

    if (updateData.status) {
      updateExpression += ", #status = :status";
      expressionAttributeValues[":status"] = updateData.status;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${patientId}`,
        SK: "PROFILE#main",
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: updateData.status
        ? { "#status": "status" }
        : undefined,
      ConditionExpression: "attribute_exists(PK)", // Ensure patient exists
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);

    if (!result.Attributes) {
      return createResponse(404, false, "Patient not found");
    }

    // Return updated patient data
    const responseData = {
      patientId: result.Attributes.patientId,
      personalInfo: result.Attributes.personalInfo,
      medicalInfo: result.Attributes.medicalInfo,
      preferences: result.Attributes.preferences,
      updatedAt: result.Attributes.updatedAt,
      status: result.Attributes.status,
    };

    return createResponse(
      200,
      true,
      "Patient updated successfully",
      responseData
    );
  } catch (error: any) {
    console.error("Update Patient Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return createResponse(404, false, "Patient not found");
    }

    return createResponse(500, false, "Failed to update patient");
  }
}
