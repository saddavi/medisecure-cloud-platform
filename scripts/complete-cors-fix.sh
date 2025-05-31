#!/bin/bash

# MediSecure - Complete CORS Fix Script
# Properly sets up CORS with correct order: method response -> integration response

echo "🔧 MediSecure - Complete CORS Fix"
echo "================================="

REGION="ap-south-1"
API_ID="e8x7hxtrul"

# Resource IDs from our existing API
REGISTER_RESOURCE_ID="9sqbo8"
LOGIN_RESOURCE_ID="78ogsi"

echo "🌐 Properly configuring CORS with correct order..."
echo "🔗 API ID: $API_ID"
echo ""

# ============= Fix /auth/register CORS =============
echo "🔧 Setting up complete CORS for /auth/register..."

# 1. First set up method response (required before integration response)
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false,
        "method.response.header.Access-Control-Allow-Origin": false
    }' \
    --region $REGION

# 2. Now set up integration response
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

echo "✅ /auth/register CORS configured"

# ============= Fix /auth/login CORS =============
echo "🔧 Setting up complete CORS for /auth/login..."

# 1. First set up method response
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false,
        "method.response.header.Access-Control-Allow-Origin": false
    }' \
    --region $REGION

# 2. Now set up integration response
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

echo "✅ /auth/login CORS configured"

# ============= Also add CORS headers to POST methods =============
echo "🔧 Adding CORS headers to POST methods..."

# Add CORS headers to POST /auth/register
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": false
    }' \
    --region $REGION

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $REGISTER_RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"
    }' \
    --region $REGION

# Add CORS headers to POST /auth/login
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": false
    }' \
    --region $REGION

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"
    }' \
    --region $REGION

echo "✅ CORS headers added to POST methods"

# ============= Deploy the API =============
echo "🚀 Deploying API with complete CORS configuration..."

DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name dev \
    --stage-description "Development stage with complete CORS" \
    --description "Complete CORS configuration for all authentication endpoints" \
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
echo "🎉 Complete CORS Configuration Applied!"
echo ""
echo "🔗 API Endpoints Ready:"
echo "• Registration: POST $API_URL/auth/register"
echo "• Login: POST $API_URL/auth/login"
echo ""
echo "🌐 CORS Headers Configured:"
echo "• OPTIONS methods: Full preflight support"
echo "• POST methods: Access-Control-Allow-Origin: *"
echo ""
echo "🧪 Test CORS preflight:"
echo "curl -X OPTIONS $API_URL/auth/register -H 'Origin: https://localhost:3000' -H 'Access-Control-Request-Method: POST' -v"
echo ""
echo "🧪 Test registration:"
echo "curl -X POST $API_URL/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@medisecure.qa\",\"password\":\"SecurePass123!\",\"firstName\":\"Ahmed\",\"lastName\":\"Al-Rashid\"}' -v"
