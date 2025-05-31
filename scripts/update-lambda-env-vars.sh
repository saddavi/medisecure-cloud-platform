#!/bin/bash

# MediSecure - Update Lambda Environment Variables
# Add COGNITO_CLIENT_SECRET to Lambda functions

echo "🔐 MediSecure - Adding COGNITO_CLIENT_SECRET to Lambda Functions"
echo "==============================================================="

# Configuration
REGION="ap-south-1"
CLIENT_SECRET="1rrkm1s2jrjab7qllqn8dmdc8inbfjkqspp328uh72af9abmpm1j"

# Lambda function names
REGISTRATION_FUNCTION="MediSecure-UserRegistration"
LOGIN_FUNCTION="MediSecure-UserLogin"

echo "📍 Region: $REGION"
echo "🔐 Client Secret: ${CLIENT_SECRET:0:10}..." # Show only first 10 characters for security
echo ""

# Function to update Lambda environment variables
update_lambda_env() {
    local function_name=$1
    echo "🔄 Updating environment variables for $function_name..."
    
    # Get current environment variables
    current_env=$(aws lambda get-function-configuration \
        --function-name "$function_name" \
        --region "$REGION" \
        --query 'Environment.Variables' \
        --output json 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to get current environment variables for $function_name"
        return 1
    fi
    
    # Create a temporary file for the updated environment variables
    temp_file=$(mktemp)
    echo "$current_env" | jq ". + {\"COGNITO_CLIENT_SECRET\": \"$CLIENT_SECRET\"}" > "$temp_file"
    
    # Update the Lambda function
    aws lambda update-function-configuration \
        --function-name "$function_name" \
        --region "$REGION" \
        --environment "file://$temp_file" \
        --output table \
        --query 'Environment.Variables' > /dev/null
    
    local result=$?
    rm -f "$temp_file"
    
    if [ $result -eq 0 ]; then
        echo "✅ Successfully updated $function_name"
    else
        echo "❌ Failed to update $function_name"
        return 1
    fi
}

# Update Registration Lambda
echo "1️⃣ Updating Registration Lambda Function..."
update_lambda_env "$REGISTRATION_FUNCTION"

echo ""

# Update Login Lambda
echo "2️⃣ Updating Login Lambda Function..."
update_lambda_env "$LOGIN_FUNCTION"

echo ""

# Verify the updates
echo "🔍 Verifying Environment Variables..."
echo ""

for function_name in "$REGISTRATION_FUNCTION" "$LOGIN_FUNCTION"; do
    echo "📋 $function_name Environment Variables:"
    aws lambda get-function-configuration \
        --function-name "$function_name" \
        --region "$REGION" \
        --query 'Environment.Variables' \
        --output table
    echo ""
done

echo "✅ Lambda environment variables update completed!"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy updated Lambda functions with: ./scripts/deploy-lambda.sh"
echo "   2. Test the registration and login endpoints"
echo "   3. Verify SECRET_HASH is working correctly"
