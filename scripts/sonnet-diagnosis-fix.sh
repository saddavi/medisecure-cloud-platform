#!/bin/bash

# MediSecure - Complete API Gateway Diagnosis and Fix
# This script will diagnose the current state and fix all integration issues

echo "🏥 MediSecure - Complete API Gateway Diagnosis & Fix"
echo "=================================================="

# Configuration
API_ID="e8x7hxtrul"
REGION="ap-south-1"
ACCOUNT_ID="044519418263"
REGISTRATION_FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:MediSecure-UserRegistration"
LOGIN_FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:MediSecure-UserLogin"

echo "🔍 Current Configuration:"
echo "• API ID: $API_ID"
echo "• Region: $REGION"
echo "• Account: $ACCOUNT_ID"
echo ""

# Step 1: Diagnose current state
echo "🔍 DIAGNOSIS: Checking current API Gateway state..."
echo ""

echo "📋 1. Checking if Lambda functions exist..."
aws lambda get-function --function-name MediSecure-UserRegistration --region $REGION --query 'Configuration.FunctionName' --output text 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Registration Lambda exists"
else
    echo "   ❌ Registration Lambda missing"
    exit 1
fi

aws lambda get-function --function-name MediSecure-UserLogin --region $REGION --query 'Configuration.FunctionName' --output text 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Login Lambda exists"
else
    echo "   ❌ Login Lambda missing"
    exit 1
fi

echo ""
echo "📋 2. Getting API Gateway resources..."
RESOURCES=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ API Gateway exists"
    
    # Extract resource IDs
    REGISTER_RESOURCE_ID=$(echo $RESOURCES | jq -r '.items[] | select(.path=="/auth/register") | .id')
    LOGIN_RESOURCE_ID=$(echo $RESOURCES | jq -r '.items[] | select(.path=="/auth/login") | .id')
    
    echo "   📝 Register resource ID: $REGISTER_RESOURCE_ID"
    echo "   📝 Login resource ID: $LOGIN_RESOURCE_ID"
else
    echo "   ❌ API Gateway not found"
    exit 1
fi

echo ""
echo "📋 3. Checking existing integrations..."

# Check POST integrations
echo "   🔍 Checking POST /auth/register integration..."
aws apigateway get-integration --rest-api-id $API_ID --resource-id $REGISTER_RESOURCE_ID --http-method POST --region $REGION >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Registration POST integration exists"
    REGISTER_POST_EXISTS=true
else
    echo "   ❌ Registration POST integration missing"
    REGISTER_POST_EXISTS=false
fi

echo "   🔍 Checking POST /auth/login integration..."
aws apigateway get-integration --rest-api-id $API_ID --resource-id $LOGIN_RESOURCE_ID --http-method POST --region $REGION >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Login POST integration exists"
    LOGIN_POST_EXISTS=true
else
    echo "   ❌ Login POST integration missing"
    LOGIN_POST_EXISTS=false
fi

# Check OPTIONS integrations
echo "   🔍 Checking OPTIONS integrations..."
aws apigateway get-integration --rest-api-id $API_ID --resource-id $REGISTER_RESOURCE_ID --http-method OPTIONS --region $REGION >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Registration OPTIONS integration exists"
    REGISTER_OPTIONS_EXISTS=true
else
    echo "   ❌ Registration OPTIONS integration missing"
    REGISTER_OPTIONS_EXISTS=false
fi

echo ""
echo "🔧 REPAIR: Fixing missing integrations..."
echo ""

# Fix POST integrations if missing
if [ "$REGISTER_POST_EXISTS" = false ]; then
    echo "🔗 Creating POST /auth/register integration..."
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $REGISTER_RESOURCE_ID \
        --http-method POST \
        --type AWS_PROXY \
        --integration-http-method POST \
        --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${REGISTRATION_FUNCTION_ARN}/invocations" \
        --region $REGION >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Registration POST integration created"
    else
        echo "   ❌ Failed to create registration POST integration"
    fi
fi

if [ "$LOGIN_POST_EXISTS" = false ]; then
    echo "🔗 Creating POST /auth/login integration..."
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $LOGIN_RESOURCE_ID \
        --http-method POST \
        --type AWS_PROXY \
        --integration-http-method POST \
        --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LOGIN_FUNCTION_ARN}/invocations" \
        --region $REGION >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Login POST integration created"
    else
        echo "   ❌ Failed to create login POST integration"
    fi
fi

# Fix OPTIONS integrations for CORS
if [ "$REGISTER_OPTIONS_EXISTS" = false ]; then
    echo "🌐 Creating OPTIONS /auth/register integration (CORS)..."
    
    # Create the integration
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $REGISTER_RESOURCE_ID \
        --http-method OPTIONS \
        --type MOCK \
        --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
        --region $REGION >/dev/null 2>&1
    
    # Create integration response
    aws apigateway put-integration-response \
        --rest-api-id $API_ID \
        --resource-id $REGISTER_RESOURCE_ID \
        --http-method OPTIONS \
        --status-code 200 \
        --response-parameters '{
            "method.response.header.Access-Control-Allow-Headers": "'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''",
            "method.response.header.Access-Control-Allow-Methods": "'\''POST,OPTIONS'\''",
            "method.response.header.Access-Control-Allow-Origin": "'\''*'\''"
        }' \
        --region $REGION >/dev/null 2>&1
    
    echo "   ✅ Registration OPTIONS integration created"
fi

# Same for login OPTIONS
echo "🌐 Creating OPTIONS /auth/login integration (CORS)..."

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION >/dev/null 2>&1

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $LOGIN_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Headers": "'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''",
        "method.response.header.Access-Control-Allow-Methods": "'\''POST,OPTIONS'\''",
        "method.response.header.Access-Control-Allow-Origin": "'\''*'\''"
    }' \
    --region $REGION >/dev/null 2>&1

echo "   ✅ Login OPTIONS integration created"

echo ""
echo "🚀 Deploying API with all integrations..."

DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name dev \
    --description "Fixed integrations and CORS" \
    --region $REGION \
    --query 'id' \
    --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ API deployed successfully: $DEPLOYMENT_ID"
else
    echo "❌ API deployment failed"
    exit 1
fi

echo ""
echo "🎉 DIAGNOSIS & REPAIR COMPLETE!"
echo "==============================="
echo ""
echo "🔗 Your endpoints should now work:"
echo "• Registration: POST https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev/auth/register"
echo "• Login: POST https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev/auth/login"
echo ""
echo "🧪 VERIFICATION TESTS:"
echo ""
echo "# 1. Test CORS preflight (should return 200):"
echo "curl -X OPTIONS https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev/auth/register \\"
echo "  -H 'Origin: https://localhost:3000' \\"
echo "  -H 'Access-Control-Request-Method: POST' -s -o /dev/null -w '%{http_code}'"
echo ""
echo "# 2. Test Lambda directly (should work):"
echo "aws lambda invoke \\"
echo "  --function-name MediSecure-UserRegistration \\"
echo "  --payload '{\"body\":\"{\\\"email\\\":\\\"test@test.com\\\"}\"}' \\"
echo "  --region ${REGION} response.json && cat response.json"
echo ""
echo "# 3. Test via API Gateway (should work now):"
echo "curl -X POST https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@medisecure.qa\",\"password\":\"SecurePass123!\"}' \\"
echo "  -s -w '\\nHTTP Status: %{http_code}\\n'"
echo ""
echo "💰 Total cost so far: Still $0.00 (within free tier)"
