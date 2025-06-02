#!/bin/bash

# MediSecure - Lambda Runtime Update Script
# Updates existing Lambda functions from Node.js 18 to Node.js 20
# Addresses AWS deprecation notice for Node.js 18 (EOL: September 1, 2025)

echo "🔄 MediSecure - Lambda Runtime Update"
echo "====================================="
echo "Updating Lambda functions from Node.js 18 to Node.js 20"
echo "Reason: Node.js 18 EOL on September 1, 2025"
echo ""

REGION="ap-south-1"
NEW_RUNTIME="nodejs20.x"

# List of functions to update
FUNCTIONS=(
    "MediSecure-UserLogin"
    "MediSecure-UserRegistration"
)

echo "🔍 Checking current runtime versions..."

for FUNCTION_NAME in "${FUNCTIONS[@]}"; do
    echo "📋 Function: $FUNCTION_NAME"
    
    # Get current runtime
    CURRENT_RUNTIME=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION" \
        --query 'Runtime' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "   Current runtime: $CURRENT_RUNTIME"
        
        if [ "$CURRENT_RUNTIME" = "nodejs18.x" ]; then
            echo "   ⚠️  Function needs update (Node.js 18 is deprecated)"
            
            echo "   🔄 Updating runtime to $NEW_RUNTIME..."
            aws lambda update-function-configuration \
                --function-name "$FUNCTION_NAME" \
                --runtime "$NEW_RUNTIME" \
                --region "$REGION" \
                --output text \
                --query 'FunctionName' > /dev/null
            
            if [ $? -eq 0 ]; then
                echo "   ✅ Successfully updated to $NEW_RUNTIME"
            else
                echo "   ❌ Failed to update runtime"
                exit 1
            fi
        elif [ "$CURRENT_RUNTIME" = "nodejs20.x" ]; then
            echo "   ✅ Already using Node.js 20 (current LTS)"
        else
            echo "   ℹ️  Using runtime: $CURRENT_RUNTIME"
        fi
    else
        echo "   ⚠️  Function not found or access denied"
    fi
    echo ""
done

echo "🔍 Verifying updates..."
echo ""

# Verify all functions are updated
for FUNCTION_NAME in "${FUNCTIONS[@]}"; do
    UPDATED_RUNTIME=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION" \
        --query 'Runtime' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "📋 $FUNCTION_NAME: $UPDATED_RUNTIME"
    fi
done

echo ""
echo "✅ Lambda runtime update completed!"
echo ""
echo "📝 Summary:"
echo "   - Updated functions to use Node.js 20 (current LTS)"
echo "   - Proactive compliance with AWS deprecation timeline"
echo "   - Functions will continue to receive security updates"
echo ""
echo "🗓️  AWS Timeline:"
echo "   - Sept 1, 2025: Node.js 18 no longer maintained"
echo "   - Oct 1, 2025: Cannot create new Node.js 18 functions"
echo "   - Nov 1, 2025: Cannot update existing Node.js 18 functions"
echo ""
echo "🔗 Reference: https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html"
