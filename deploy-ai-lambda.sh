#!/bin/bash

# MediSecure AI Lambda Deployment Script
# This script manually deploys the AI symptom analysis Lambda function
# Use this as a workaround for the CDK hanging issue

set -e

echo "🚀 MediSecure AI Lambda Deployment Script"
echo "==========================================="

# Configuration
REGION="me-south-1"
FUNCTION_NAME="MediSecure-AI-SymptomAnalysis"
ROLE_NAME="MediSecure-AI-Lambda-Role"
TABLE_NAME="MediSecure-Public-Symptom-Sessions"
POLICY_NAME="MediSecure-AI-Policy"

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  Function: $FUNCTION_NAME"
echo "  Role: $ROLE_NAME"
echo "  Table: $TABLE_NAME"
echo ""

# Step 1: Create DynamoDB table
echo "1️⃣ Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=sessionId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    --tags Key=Project,Value=MediSecure Key=Component,Value=AI-Analysis Key=Environment,Value=prod \
    || echo "Table might already exist"

# Enable TTL
echo "  Enabling TTL on table..."
aws dynamodb update-time-to-live \
    --table-name $TABLE_NAME \
    --time-to-live-specification Enabled=true,AttributeName=ttl \
    --region $REGION \
    || echo "TTL might already be enabled"

# Step 2: Create IAM role
echo "2️⃣ Creating IAM role..."
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --region $REGION \
    || echo "Role might already exist"

# Step 3: Create IAM policy
echo "3️⃣ Creating IAM policy..."
cat > /tmp/lambda-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:$REGION:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:$REGION:*:table/$TABLE_NAME",
        "arn:aws:dynamodb:$REGION:*:table/MediSecure-HealthData*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:$REGION::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
    }
  ]
}
EOF

aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/lambda-policy.json \
    --region $REGION \
    || echo "Policy might already exist"

# Attach policy to role
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME \
    --region $REGION

# Step 4: Package Lambda function
echo "4️⃣ Packaging Lambda function..."
cd /Users/talha/medisecure-cloud-platform/backend

# Install dependencies
npm install

# Create deployment package
mkdir -p dist
cp -r src dist/
cp -r node_modules dist/
cp package.json dist/

cd dist
zip -r ../ai-lambda-deployment.zip .
cd ..

# Step 5: Create/Update Lambda function
echo "5️⃣ Creating Lambda function..."
ROLE_ARN="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME"

# Wait for role to be ready
echo "  Waiting for IAM role to be ready..."
sleep 10

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "  Function exists, updating code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://ai-lambda-deployment.zip \
        --region $REGION
    
    # Update environment variables
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={DYNAMODB_TABLE_NAME=$TABLE_NAME,BEDROCK_REGION=$REGION,BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0}" \
        --region $REGION
else
    echo "  Creating new function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler ai/anonymous-symptom-analysis.handler \
        --zip-file fileb://ai-lambda-deployment.zip \
        --memory-size 512 \
        --timeout 45 \
        --environment "Variables={DYNAMODB_TABLE_NAME=$TABLE_NAME,BEDROCK_REGION=$REGION,BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0}" \
        --region $REGION \
        --tags Project=MediSecure,Component=AI-Analysis,Environment=prod
fi

# Step 6: Get existing API Gateway ID
echo "6️⃣ Setting up API Gateway integration..."
API_ID=$(aws apigateway get-rest-apis --region $REGION --query 'items[?name==`MediSecure-API`].id' --output text)

if [ "$API_ID" = "None" ] || [ -z "$API_ID" ]; then
    echo "⚠️  API Gateway not found. You'll need to run CDK deploy first or create API manually."
    echo "✅ Lambda function deployed successfully!"
    echo "🔗 Function ARN: arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME"
else
    echo "  Found API Gateway: $API_ID"
    echo "  Integration setup would require CDK or manual API Gateway configuration"
    echo "✅ Lambda function deployed successfully!"
fi

echo ""
echo "🎉 Deployment Summary:"
echo "  ✅ DynamoDB table: $TABLE_NAME"
echo "  ✅ Lambda function: $FUNCTION_NAME"
echo "  ✅ IAM role and policies configured"
echo "  ⚠️  API Gateway integration pending"
echo ""
echo "🧪 Test the function:"
echo "aws lambda invoke --function-name $FUNCTION_NAME --payload '{\"body\":\"{\\\"symptoms\\\":{\\\"description\\\":\\\"headache\\\",\\\"severity\\\":5},\\\"language\\\":\\\"en\\\",\\\"isAnonymous\\\":true}\"}' --region $REGION response.json"

# Cleanup temp files
rm -f /tmp/trust-policy.json /tmp/lambda-policy.json

echo "Done! 🚀"
