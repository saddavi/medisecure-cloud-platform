#!/bin/bash

# MediSecure - Fix CORS Integration Script
# Sets up proper CORS preflight responses for OPTIONS methods

echo "🔧 MediSecure - Fixing CORS Integration"
echo "======================================="

REGION="ap-south-1"
API_ID="e8x7hxtrul"

# Resource IDs from our existing API
REGISTER_RESOURCE_ID="9sqbo8"
LOGIN_RESOURCE_ID="78ogsi"

echo "🌐 Setting up CORS preflight responses..."
echo "🔗 API ID: $API_ID"
echo ""

# ============= Fix /auth/register OPTIONS Integration =============
echo "🔧 Setting up /auth/register OPTIONS integration..."

# Set up mock integration for OPTIONS method
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --integration-http-method OPTIONS \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION

# Set up integration response for OPTIONS
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'",
        "method.response.header.Access-Control-Allow-Methods": "'"'"'POST,OPTIONS'"'"'",
        "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"
    }' \
    --region $REGION

# Set up method response for OPTIONS
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Origin": true
    }' \
    --region $REGION

echo "✅ /auth/register OPTIONS integration configured"

# ============= Fix /auth/login OPTIONS Integration =============
echo "🔧 Setting up /auth/login OPTIONS integration..."

# Set up mock integration for OPTIONS method
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --integration-http-method OPTIONS \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION

# Set up integration response for OPTIONS
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'",
        "method.response.header.Access-Control-Allow-Methods": "'"'"'POST,OPTIONS'"'"'",
        "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"
    }' \
    --region $REGION

# Set up method response for OPTIONS
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
        "method.response.header.Access-Control-Allow-Origin": true
    }' \
    --region $REGION

echo "✅ /auth/login OPTIONS integration configured"

# ============= Deploy the API =============
echo "🚀 Deploying API with CORS fixes..."

DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name dev \
    --stage-description "Development stage with CORS fixes" \
    --description "CORS integration fixes for authentication endpoints" \
    --region $REGION \
    --query 'id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ API deployed successfully: $DEPLOYMENT_ID"
else
    echo "❌ API deployment failed"
    exit 1
fi

# ============= Get API URL =============
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev"

echo ""
echo "🎉 CORS Integration Fixed!"
echo ""
echo "🔗 API Endpoints Ready:"
echo "• Registration: POST $API_URL/auth/register"
echo "• Login: POST $API_URL/auth/login"
echo ""
echo "🌐 CORS Headers Configured:"
echo "• Access-Control-Allow-Origin: *"
echo "• Access-Control-Allow-Methods: POST, OPTIONS"
echo "• Access-Control-Allow-Headers: Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token"
echo ""
echo "🧪 Test CORS preflight:"
echo "curl -X OPTIONS $API_URL/auth/register \\"
echo "  -H 'Origin: https://localhost:3000' \\"
echo "  -H 'Access-Control-Request-Method: POST' \\"
echo "  -H 'Access-Control-Request-Headers: Content-Type'"
echo ""
echo "🧪 Test registration:"
echo "curl -X POST $API_URL/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@medisecure.qa\",\"password\":\"SecurePass123!\",\"firstName\":\"Ahmed\",\"lastName\":\"Al-Rashid\"}'"
