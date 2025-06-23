import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB Service for MediSecure Cloud Platform
 * Handles all database operations with proper error handling
 */

export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "me-south-1",
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_TABLE_NAME || "MediSecure-HealthData";
  }

  /**
   * Put item into DynamoDB
   */
  async putItem(item: any): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        })
      );
    } catch (error) {
      console.error("DynamoDB put error:", error);
      throw new Error("Failed to save data");
    }
  }

  /**
   * Get item from DynamoDB
   */
  async getItem(pk: string, sk: string): Promise<any> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
        })
      );
      return result.Item;
    } catch (error) {
      console.error("DynamoDB get error:", error);
      throw new Error("Failed to retrieve data");
    }
  }

  /**
   * Query items from DynamoDB
   */
  async queryItems(
    pk: string,
    options?: {
      limit?: number;
      startKey?: any;
      sortKeyCondition?: string;
    }
  ): Promise<{ items: any[]; lastEvaluatedKey?: any }> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": pk },
          Limit: options?.limit,
          ExclusiveStartKey: options?.startKey,
        })
      );

      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      console.error("DynamoDB query error:", error);
      throw new Error("Failed to query data");
    }
  }

  /**
   * Update item in DynamoDB
   */
  async updateItem(pk: string, sk: string, updates: any): Promise<void> {
    try {
      const updateExpression =
        "SET " +
        Object.keys(updates)
          .map((key) => `#${key} = :${key}`)
          .join(", ");
      const expressionAttributeNames = Object.keys(updates).reduce(
        (acc, key) => {
          acc[`#${key}`] = key;
          return acc;
        },
        {} as any
      );
      const expressionAttributeValues = Object.keys(updates).reduce(
        (acc, key) => {
          acc[`:${key}`] = updates[key];
          return acc;
        },
        {} as any
      );

      await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    } catch (error) {
      console.error("DynamoDB update error:", error);
      throw new Error("Failed to update data");
    }
  }
}
