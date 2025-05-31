#!/bin/bash

# MediSecure - API Gateway Setup Script
# Creates REST API with Lambda integration and Cognito authorization

echo "🌐 MediSecure - API Gateway Setup"
echo "=================================="

REGION="ap-south-1"
API_NAME="MediSecure-HealthcareAPI"
STAGE_NAME="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Lambda function ARNs
REGISTRATION_FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:MediSecure-UserRegistration"
LOGIN_FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:MediSecure-UserLogin"

echo "🏗️ Setting up API Gateway for healthcare endpoints..."
echo "📍 Region: $REGION"
echo "🔗 Registration Function: $REGISTRATION_FUNCTION_ARN"
echo "🔗 Login Function: $LOGIN_FUNCTION_ARN"
echo ""

# ============= Step 1: Create REST API =============
echo "🆕 Creating REST API..."

API_ID=$(aws apigateway create-rest-api \
    --name "$API_NAME" \
    --description "MediSecure Healthcare Platform REST API" \
    --endpoint-configuration types=REGIONAL \
    --region $REGION \
    --query 'id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ REST API created: $API_ID"
else
    echo "❌ Failed to create REST API"
    exit 1
fi

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[0].id' \
    --output text)

echo "📁 Root resource ID: $ROOT_RESOURCE_ID"

# ============= Step 2: Create /auth Resource =============
echo "📁 Creating /auth resource..."

AUTH_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part "auth" \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ Auth resource created: $AUTH_RESOURCE_ID"

# ============= Step 3: Create /auth/register Resource =============
echo "📁 Creating /auth/register resource..."

REGISTER_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $AUTH_RESOURCE_ID \
    --path-part "register" \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ Register resource created: $REGISTER_RESOURCE_ID"

# ============= Step 4: Create /auth/login Resource =============
echo "📁 Creating /auth/login resource..."

LOGIN_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $AUTH_RESOURCE_ID \
    --path-part "login" \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ Login resource created: $LOGIN_RESOURCE_ID"

# ============= Step 5: Create POST Method for Registration =============
echo "📤 Creating POST method for registration..."

aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION

# Integration with Lambda
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${REGISTRATION_FUNCTION_ARN}/invocations" \
    --region $REGION

echo "✅ Registration endpoint configured"

# ============= Step 6: Create POST Method for Login =============
echo "📤 Creating POST method for login..."

aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION

# Integration with Lambda
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LOGIN_FUNCTION_ARN}/invocations" \
    --region $REGION

echo "✅ Login endpoint configured"

# ============= Step 7: Grant API Gateway Permission to Invoke Lambda =============
echo "🔐 Granting API Gateway permissions to invoke Lambda functions..."

# Registration function permission
aws lambda add-permission \
    --function-name MediSecure-UserRegistration \
    --statement-id apigateway-registration-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
    --region $REGION

# Login function permission
aws lambda add-permission \
    --function-name MediSecure-UserLogin \
    --statement-id apigateway-login-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
    --region $REGION

echo "✅ Lambda permissions configured"

# ============= Step 8: Enable CORS =============
echo "🌐 Enabling CORS for web browser access..."

# Add OPTIONS method for CORS preflight
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION

aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION

echo "✅ CORS configured"

# ============= Step 9: Deploy API =============
echo "🚀 Deploying API to $STAGE_NAME stage..."

DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE_NAME \
    --stage-description "Development stage for MediSecure API" \
    --description "Initial deployment with authentication endpoints" \
    --region $REGION \
    --query 'id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ API deployed successfully: $DEPLOYMENT_ID"
else
    echo "❌ API deployment failed"
    exit 1
fi

# ============= Step 10: Get API URL =============
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}"

echo ""
echo "🎉 API Gateway Setup Complete!"
echo ""
echo "📊 API Details:"
echo "• API ID: $API_ID"
echo "• Stage: $STAGE_NAME"
echo "• Region: $REGION"
echo ""
echo "🔗 API Endpoints:"
echo "• Registration: POST $API_URL/auth/register"
echo "• Login: POST $API_URL/auth/login"
echo ""
echo "🌐 API Gateway Console:"
echo "https://ap-south-1.console.aws.amazon.com/apigateway/main/apis/$API_ID/resources"
echo ""
echo "💰 Cost Estimate:"
echo "• First 333M requests/month: FREE (12 months)"
echo "• After free tier: $3.50 per million requests"
echo ""
echo "🧪 Test your API:"
echo "curl -X POST $API_URL/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@medisecure.qa\",\"password\":\"SecurePass123!\",\"firstName\":\"Ahmed\",\"lastName\":\"Al-Rashid\"}'"
