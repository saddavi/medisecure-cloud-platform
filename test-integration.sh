#!/bin/bash

# MediSecure Integration Test Script
# Tests the complete AWS integration flow

set -e

echo "🔬 Starting MediSecure Integration Tests..."
echo "=================================================="

# Test 1: API Gateway Health Check
echo "📡 Testing API Gateway connectivity..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com/dev/health" -H "Content-Type: application/json")
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ API Gateway is responding (requires authentication as expected)"
else
    echo "⚠️  API Gateway response code: $HTTP_CODE"
fi

# Test 2: Cognito User Pool Check
echo "🔐 Testing Cognito User Pool..."
USER_CHECK=$(aws cognito-idp admin-get-user \
    --user-pool-id ap-south-1_4Cr7XFUmS \
    --username test@medisecure.dev \
    --region ap-south-1 2>/dev/null || echo "USER_NOT_FOUND")

if [[ "$USER_CHECK" != "USER_NOT_FOUND" ]]; then
    echo "✅ Cognito User Pool is accessible and test user exists"
else
    echo "❌ Cognito User Pool test failed"
fi

# Test 3: Try to get a Cognito token (this will test the auth flow)
echo "🎫 Testing Cognito authentication flow..."
AUTH_RESPONSE=$(aws cognito-idp admin-initiate-auth \
    --user-pool-id ap-south-1_4Cr7XFUmS \
    --client-id 9poj7iavug62uuif7sve7a6fo \
    --auth-flow ADMIN_NO_SRP_AUTH \
    --auth-parameters USERNAME=test@medisecure.dev,PASSWORD=TempPass123! \
    --region ap-south-1 2>/dev/null || echo "AUTH_FAILED")

if [[ "$AUTH_RESPONSE" != "AUTH_FAILED" ]]; then
    echo "✅ Cognito authentication is working"
    
    # Extract access token for API test
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"AccessToken":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$ACCESS_TOKEN" ]; then
        echo "🔑 Got access token, testing authenticated API call..."
        
        # Test 4: Authenticated API call
        API_RESPONSE=$(curl -s -w "%{http_code}" \
            "https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com/dev/patients?limit=1" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        API_HTTP_CODE="${API_RESPONSE: -3}"
        
        if [ "$API_HTTP_CODE" = "200" ]; then
            echo "✅ Authenticated API call successful"
        else
            echo "⚠️  Authenticated API call returned: $API_HTTP_CODE"
            echo "Response: ${API_RESPONSE%???}"
        fi
    fi
else
    echo "❌ Cognito authentication failed"
fi

echo "=================================================="
echo "🎯 Integration tests completed!"
echo "📝 Next steps: Test the frontend UI components"
