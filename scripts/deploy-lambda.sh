#!/bin/bash

# MediSecure - Lambda Deployment Script
# Deploys user registration and login functions to AWS Lambda

echo "🏥 MediSecure - Lambda Function Deployment"
echo "=========================================="

# Configuration
REGION="me-south-1"  # Bahrain - closest to user's location
FUNCTION_PREFIX="MediSecure"
RUNTIME="nodejs20.x"  # Updated from deprecated nodejs18.x (EOL: Sept 1, 2025)
TIMEOUT=30
MEMORY=256
ROLE_NAME="MediSecure-LambdaExecutionRole"

# Get account ID and build role ARN dynamically
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Environment variables for Lambda
COGNITO_USER_POOL_ID="ap-south-1_4Cr7XFUmS"  # Note: Different region from DynamoDB for existing users
COGNITO_CLIENT_ID="34oik0kokq9l20kiqs3kvth2li"
DYNAMODB_TABLE_NAME="MediSecure-HealthData"

echo "🔐 Using IAM Role: $ROLE_ARN"

echo "📦 Building and packaging Lambda functions..."

# Build the project from backend directory
cd backend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Create deployment package
echo "📦 Creating deployment package..."
cd dist
zip -r ../../lambda-deployment.zip . -q
cd ..

# Add node_modules to the package
zip -r ../lambda-deployment.zip node_modules -q
cd ..

echo "✅ Deployment package created: lambda-deployment.zip"
echo "📋 Package size: $(du -h lambda-deployment.zip | cut -f1)"

# Deploy Registration Function
echo ""
echo "🚀 Deploying Registration Lambda Function..."

# Check if function exists
aws lambda get-function --function-name "${FUNCTION_PREFIX}-UserRegistration" --region $REGION &>/dev/null

if [ $? -eq 0 ]; then
    echo "📝 Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "${FUNCTION_PREFIX}-UserRegistration" \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
else
    echo "🆕 Creating new function..."
    aws lambda create-function \
        --function-name "${FUNCTION_PREFIX}-UserRegistration" \
        --runtime $RUNTIME \
        --role "$ROLE_ARN" \
        --handler "auth/register.handler" \
        --zip-file fileb://lambda-deployment.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --environment Variables="{COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID,COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID}" \
        --region $REGION
fi

if [ $? -eq 0 ]; then
    echo "✅ Registration function deployed successfully"
else
    echo "❌ Registration function deployment failed"
    exit 1
fi

# Deploy Login Function
echo ""
echo "🚀 Deploying Login Lambda Function..."

# Check if function exists
aws lambda get-function --function-name "${FUNCTION_PREFIX}-UserLogin" --region $REGION &>/dev/null

if [ $? -eq 0 ]; then
    echo "📝 Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "${FUNCTION_PREFIX}-UserLogin" \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
else
    echo "🆕 Creating new function..."
    aws lambda create-function \
        --function-name "${FUNCTION_PREFIX}-UserLogin" \
        --runtime $RUNTIME \
        --role "$ROLE_ARN" \
        --handler "auth/login.handler" \
        --zip-file fileb://lambda-deployment.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --environment Variables="{COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID,COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID}" \
        --region $REGION
fi

if [ $? -eq 0 ]; then
    echo "✅ Login function deployed successfully"
else
    echo "❌ Login function deployment failed"
    exit 1
fi

# Deploy Patient Management Function
echo ""
echo "🚀 Deploying Patient Management Lambda Function..."

# Check if function exists
aws lambda get-function --function-name "${FUNCTION_PREFIX}-PatientManagement" --region $REGION &>/dev/null

if [ $? -eq 0 ]; then
    echo "📝 Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "${FUNCTION_PREFIX}-PatientManagement" \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
else
    echo "🆕 Creating new function..."
    aws lambda create-function \
        --function-name "${FUNCTION_PREFIX}-PatientManagement" \
        --runtime $RUNTIME \
        --role "$ROLE_ARN" \
        --handler "patient/patient-management.handler" \
        --zip-file fileb://lambda-deployment.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --environment Variables="{DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region $REGION
fi

if [ $? -eq 0 ]; then
    echo "✅ Patient Management function deployed successfully"
else
    echo "❌ Patient Management function deployment failed"
    exit 1
fi

# Deploy Medical Records Function
echo ""
echo "🚀 Deploying Medical Records Lambda Function..."

# Check if function exists
aws lambda get-function --function-name "${FUNCTION_PREFIX}-MedicalRecords" --region $REGION &>/dev/null

if [ $? -eq 0 ]; then
    echo "📝 Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "${FUNCTION_PREFIX}-MedicalRecords" \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
else
    echo "🆕 Creating new function..."
    aws lambda create-function \
        --function-name "${FUNCTION_PREFIX}-MedicalRecords" \
        --runtime $RUNTIME \
        --role "$ROLE_ARN" \
        --handler "medical/medical-records.handler" \
        --zip-file fileb://lambda-deployment.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --environment Variables="{DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region $REGION
fi

if [ $? -eq 0 ]; then
    echo "✅ Medical Records function deployed successfully"
else
    echo "❌ Medical Records function deployment failed"
    exit 1
fi

# Clean up
rm lambda-deployment.zip

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Function Details:"
echo "• Registration: ${FUNCTION_PREFIX}-UserRegistration"
echo "• Login: ${FUNCTION_PREFIX}-UserLogin"
echo "• Patient Management: ${FUNCTION_PREFIX}-PatientManagement"
echo "• Medical Records: ${FUNCTION_PREFIX}-MedicalRecords"
echo "• Runtime: $RUNTIME"
echo "• Memory: ${MEMORY}MB"
echo "• Timeout: ${TIMEOUT}s"
echo "• Region: $REGION"
echo ""
echo "🔗 Quick Access:"
echo "Lambda Console: https://me-south-1.console.aws.amazon.com/lambda/home?region=me-south-1#/functions"
echo ""
echo "💡 Next Steps:"
echo "1. Test functions in Lambda console"
echo "2. Set up API Gateway"
echo "3. Configure CORS and authentication"
echo ""
echo "💰 Estimated Cost: ~$0.20 per 1M requests (Free tier: 1M requests/month)"
