// MediSecure Cloud Platform - Medical Records Lambda
// HIPAA-compliant medical records management

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils/response";
import {
  MedicalRecord,
  MedicalRecordCreateRequest,
  MedicalRecordUpdateRequest,
} from "../types";

// ============= AWS SDK Configuration =============
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

// ============= Medical Records Handler =============
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Medical Records Request:", JSON.stringify(event, null, 2));

    const { httpMethod, pathParameters, body } = event;
    const patientId = pathParameters?.patientId;
    const recordId = pathParameters?.recordId;

    if (!patientId) {
      return createResponse(400, false, "Patient ID is required");
    }

    switch (httpMethod) {
      case "GET":
        if (recordId) {
          return await getMedicalRecord(patientId, recordId);
        } else {
          return await listMedicalRecords(patientId, event);
        }

      case "POST":
        return await createMedicalRecord(patientId, body);

      case "PUT":
        if (!recordId) {
          return createResponse(
            400,
            false,
            "Record ID is required for updates"
          );
        }
        return await updateMedicalRecord(patientId, recordId, body);

      default:
        return createResponse(405, false, "Method not allowed");
    }
  } catch (error) {
    console.error("Medical Records Error:", error);
    return createResponse(
      500,
      false,
      "Internal server error",
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
};

// ============= Medical Record Operations =============

/**
 * Get specific medical record
 */
async function getMedicalRecord(
  patientId: string,
  recordId: string
): Promise<APIGatewayProxyResult> {
  try {
    // Query for the specific record (we need the full SK to get exact record)
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${patientId}`,
        ":skPrefix": `RECORD#${recordId}`,
      },
      Limit: 1,
    });

    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return createResponse(404, false, "Medical record not found");
    }

    const record = result.Items[0];

    // Remove internal fields and return clinical data
    const medicalRecordData = {
      recordId: record.recordId,
      recordType: record.recordType,
      patientId: record.patientId,
      providerId: record.providerId,
      visitInfo: record.visitInfo,
      clinicalData: record.clinicalData,
      followUp: record.followUp,
      attachments: record.attachments,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.status,
    };

    return createResponse(
      200,
      true,
      "Medical record retrieved successfully",
      medicalRecordData
    );
  } catch (error) {
    console.error("Get Medical Record Error:", error);
    return createResponse(500, false, "Failed to retrieve medical record");
  }
}

/**
 * List medical records for a patient
 */
async function listMedicalRecords(
  patientId: string,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit || "20");
    const recordType = queryParams.recordType; // Filter by record type if specified
    const lastEvaluatedKey = queryParams.lastKey
      ? JSON.parse(decodeURIComponent(queryParams.lastKey))
      : undefined;

    let keyConditionExpression = "PK = :pk AND begins_with(SK, :skPrefix)";
    const expressionAttributeValues: any = {
      ":pk": `USER#${patientId}`,
      ":skPrefix": "RECORD#",
    };

    // Add record type filter if specified
    let filterExpression;
    if (recordType) {
      filterExpression = "recordType = :recordType";
      expressionAttributeValues[":recordType"] = recordType;
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: keyConditionExpression,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
      ScanIndexForward: false, // Get most recent records first
    });

    const result = await docClient.send(command);

    const records =
      result.Items?.map((item) => ({
        recordId: item.recordId,
        recordType: item.recordType,
        providerId: item.providerId,
        visitInfo: {
          date: item.visitInfo?.date,
          type: item.visitInfo?.type,
          location: item.visitInfo?.location,
        },
        clinicalData: {
          chiefComplaint: item.clinicalData?.chiefComplaint,
          diagnosis: item.clinicalData?.diagnosis,
        },
        createdAt: item.createdAt,
        status: item.status,
      })) || [];

    const response = {
      records,
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
      "Medical records retrieved successfully",
      response
    );
  } catch (error) {
    console.error("List Medical Records Error:", error);
    return createResponse(500, false, "Failed to retrieve medical records");
  }
}

/**
 * Create new medical record
 */
async function createMedicalRecord(
  patientId: string,
  requestBody: string | null
): Promise<APIGatewayProxyResult> {
  try {
    if (!requestBody) {
      return createResponse(400, false, "Request body is required");
    }

    const recordData: MedicalRecordCreateRequest = JSON.parse(requestBody);

    // Validate required fields
    if (
      !recordData.recordType ||
      !recordData.providerId ||
      !recordData.visitInfo
    ) {
      return createResponse(
        400,
        false,
        "Record type, provider ID, and visit info are required"
      );
    }

    // Generate record ID and timestamp
    const recordId = `${recordData.recordType.toLowerCase()}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const visitDate = recordData.visitInfo.date || timestamp;

    // Create medical record
    const medicalRecord: MedicalRecord = {
      PK: `USER#${patientId}`,
      SK: `RECORD#${recordId}#${visitDate}`,
      GSI1PK: `PROVIDER#${recordData.providerId}`,
      GSI1SK: `RECORD#${visitDate}`,
      GSI2PK: `RECORD_TYPE#${recordData.recordType}`,
      GSI2SK: visitDate,
      entityType: "RECORD",
      recordType: recordData.recordType,
      recordId,
      patientId,
      providerId: recordData.providerId,
      appointmentId: recordData.appointmentId,
      visitInfo: {
        date: visitDate,
        type: recordData.visitInfo.type,
        duration: recordData.visitInfo.duration || 30,
        location: recordData.visitInfo.location,
      },
      clinicalData: recordData.clinicalData,
      followUp: recordData.followUp || { required: false },
      attachments: recordData.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "DRAFT", // Start as draft, can be updated to COMPLETED
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: medicalRecord,
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    });

    await docClient.send(command);

    // Return created record data (without internal fields)
    const responseData = {
      recordId,
      recordType: medicalRecord.recordType,
      patientId: medicalRecord.patientId,
      providerId: medicalRecord.providerId,
      visitInfo: medicalRecord.visitInfo,
      clinicalData: medicalRecord.clinicalData,
      followUp: medicalRecord.followUp,
      attachments: medicalRecord.attachments,
      createdAt: medicalRecord.createdAt,
      status: medicalRecord.status,
    };

    return createResponse(
      201,
      true,
      "Medical record created successfully",
      responseData
    );
  } catch (error: any) {
    console.error("Create Medical Record Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return createResponse(409, false, "Medical record already exists");
    }

    return createResponse(500, false, "Failed to create medical record");
  }
}

/**
 * Update medical record
 */
async function updateMedicalRecord(
  patientId: string,
  recordId: string,
  requestBody: string | null
): Promise<APIGatewayProxyResult> {
  try {
    if (!requestBody) {
      return createResponse(400, false, "Request body is required");
    }

    const updateData: MedicalRecordUpdateRequest = JSON.parse(requestBody);
    const timestamp = new Date().toISOString();

    // First, find the exact record to get the full SK
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${patientId}`,
        ":skPrefix": `RECORD#${recordId}`,
      },
      Limit: 1,
    });

    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return createResponse(404, false, "Medical record not found");
    }

    const existingRecord = queryResult.Items[0];

    // Build update expression dynamically
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues: any = {
      ":updatedAt": timestamp,
    };

    if (updateData.clinicalData) {
      updateExpression += ", clinicalData = :clinicalData";
      expressionAttributeValues[":clinicalData"] = updateData.clinicalData;
    }

    if (updateData.followUp) {
      updateExpression += ", followUp = :followUp";
      expressionAttributeValues[":followUp"] = updateData.followUp;
    }

    if (updateData.attachments) {
      updateExpression += ", attachments = :attachments";
      expressionAttributeValues[":attachments"] = updateData.attachments;
    }

    if (updateData.status) {
      updateExpression += ", #status = :status";
      expressionAttributeValues[":status"] = updateData.status;
    }

    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: existingRecord.PK,
        SK: existingRecord.SK,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: updateData.status
        ? { "#status": "status" }
        : undefined,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(updateCommand);

    if (!result.Attributes) {
      return createResponse(404, false, "Medical record not found");
    }

    // Return updated record data
    const responseData = {
      recordId: result.Attributes.recordId,
      recordType: result.Attributes.recordType,
      patientId: result.Attributes.patientId,
      providerId: result.Attributes.providerId,
      visitInfo: result.Attributes.visitInfo,
      clinicalData: result.Attributes.clinicalData,
      followUp: result.Attributes.followUp,
      attachments: result.Attributes.attachments,
      updatedAt: result.Attributes.updatedAt,
      status: result.Attributes.status,
    };

    return createResponse(
      200,
      true,
      "Medical record updated successfully",
      responseData
    );
  } catch (error) {
    console.error("Update Medical Record Error:", error);
    return createResponse(500, false, "Failed to update medical record");
  }
}
