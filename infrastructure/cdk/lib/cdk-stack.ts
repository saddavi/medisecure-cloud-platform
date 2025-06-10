import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class MediSecureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============= DynamoDB Table =============
    // Main table for healthcare data with HIPAA compliance
    const healthDataTable = new dynamodb.Table(this, "MediSecure-HealthData", {
      tableName: "MediSecure-HealthData",
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      // HIPAA Compliance: Encryption at rest
      encryption: dynamodb.TableEncryption.AWS_MANAGED,

      // Performance: On-demand billing for unpredictable healthcare workloads
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      // Data Protection: Point-in-time recovery for critical medical data
      pointInTimeRecovery: true,

      // Compliance: Enable deletion protection for production
      deletionProtection: true,

      // Data Lifecycle: TTL for temporary data (sessions, tokens)
      timeToLiveAttribute: "ttl",

      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect medical data
    });

    // ============= Global Secondary Indexes =============

    // GSI1: Email-based user lookup for authentication
    healthDataTable.addGlobalSecondaryIndex({
      indexName: "GSI1-Email-Index",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // GSI2: Provider-based queries for medical records
    healthDataTable.addGlobalSecondaryIndex({
      indexName: "GSI2-Provider-Index",
      partitionKey: {
        name: "GSI2PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI2SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // GSI3: Date-based appointment scheduling
    healthDataTable.addGlobalSecondaryIndex({
      indexName: "GSI3-Date-Index",
      partitionKey: {
        name: "GSI3PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI3SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // ============= IAM Role for Lambda Functions =============
    const lambdaRole = new iam.Role(this, "MediSecure-Lambda-Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB permissions with least privilege
    healthDataTable.grantReadWriteData(lambdaRole);

    // ============= Lambda Functions =============

    // Patient Management Lambda - Updated to Node.js 20 (current LTS)
    const patientManagementFunction = new lambda.Function(
      this,
      "MediSecure-PatientManagement",
      {
        runtime: lambda.Runtime.NODEJS_20_X, // Updated from deprecated Node.js 18
        handler: "patient-management.handler",
        code: lambda.Code.fromAsset("../../backend/dist"),
        role: lambdaRole,
        environment: {
          DYNAMODB_TABLE_NAME: healthDataTable.tableName,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1", // Performance optimization
          DEPLOYMENT_REGION: "me-south-1", // Custom variable for our region reference
        },
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
      }
    );

    // Medical Records Lambda - Updated to Node.js 20 (current LTS)
    const medicalRecordsFunction = new lambda.Function(
      this,
      "MediSecure-MedicalRecords",
      {
        runtime: lambda.Runtime.NODEJS_20_X, // Updated from deprecated Node.js 18
        handler: "medical-records.handler",
        code: lambda.Code.fromAsset("../../backend/dist"),
        role: lambdaRole,
        environment: {
          DYNAMODB_TABLE_NAME: healthDataTable.tableName,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          DEPLOYMENT_REGION: "me-south-1", // Custom variable for our region reference
        },
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
      }
    );

    // ============= API Gateway Integration =============
    const api = new apigateway.RestApi(this, "MediSecure-API", {
      restApiName: "MediSecure Healthcare API",
      description: "HIPAA-compliant healthcare platform API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
      },
    });

    // Patient management endpoints
    const patientsResource = api.root.addResource("patients");
    patientsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(patientManagementFunction)
    );
    patientsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(patientManagementFunction)
    );

    const patientResource = patientsResource.addResource("{patientId}");
    patientResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(patientManagementFunction)
    );
    patientResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(patientManagementFunction)
    );

    // Medical records endpoints
    const recordsResource = patientResource.addResource("records");
    recordsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(medicalRecordsFunction)
    );
    recordsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(medicalRecordsFunction)
    );

    // ============= Outputs =============
    new cdk.CfnOutput(this, "DynamoDBTableName", {
      value: healthDataTable.tableName,
      description: "Name of the DynamoDB table for healthcare data",
    });

    new cdk.CfnOutput(this, "APIGatewayURL", {
      value: api.url,
      description: "URL of the API Gateway for healthcare endpoints",
    });

    new cdk.CfnOutput(this, "LambdaRoleArn", {
      value: lambdaRole.roleArn,
      description: "ARN of the Lambda execution role",
    });
  }
}
