#!/bin/bash

# MediSecure - AWS Cognito User Pool Setup
# Phase 1: Authentication System

echo "🔐 MediSecure - Setting up AWS Cognito User Pool"
echo "=============================================="

# Configuration
PROJECT_NAME="MediSecure"
REGION="ap-south-1"  # Mumbai region (closest to Qatar)
USER_POOL_NAME="${PROJECT_NAME}-UserPool"

echo "📍 Region: $REGION"
echo "👥 User Pool: $USER_POOL_NAME"
echo ""

# Step 1: Create User Pool with healthcare-compliant password policy
echo "🏗️  Creating Cognito User Pool..."

USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "$USER_POOL_NAME" \
    --region $REGION \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 12,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": true,
            "TemporaryPasswordValidityDays": 7
        }
    }' \
    --auto-verified-attributes email \
    --username-attributes email \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE",
        "EmailSubject": "MediSecure - Verify Your Account",
        "EmailMessage": "Welcome to MediSecure! Your verification code is {####}. This code expires in 24 hours."
    }' \
    --user-pool-tags '{
        "Project": "MediSecure",
        "Environment": "Development",
        "CostCenter": "Healthcare-Platform"
    }' \
    --query 'UserPool.Id' \
    --output text)

if [ $? -eq 0 ] && [ ! -z "$USER_POOL_ID" ]; then
    echo "✅ User Pool created successfully!"
    echo "📝 User Pool ID: $USER_POOL_ID"
else
    echo "❌ Failed to create User Pool"
    exit 1
fi

# Step 2: Create User Pool Client (App Client)
echo ""
echo "📱 Creating User Pool Client..."

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-name "${PROJECT_NAME}-WebApp" \
    --region $REGION \
    --explicit-auth-flows ALLOW_ADMIN_USER_PASSWORD_AUTH ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
    --generate-secret \
    --token-validity-units '{
        "AccessToken": "hours",
        "IdToken": "hours", 
        "RefreshToken": "days"
    }' \
    --access-token-validity 1 \
    --id-token-validity 1 \
    --refresh-token-validity 30 \
    --query 'UserPoolClient.ClientId' \
    --output text)

if [ $? -eq 0 ] && [ ! -z "$CLIENT_ID" ]; then
    echo "✅ User Pool Client created successfully!"
    echo "📝 Client ID: $CLIENT_ID"
else
    echo "❌ Failed to create User Pool Client"
    exit 1
fi

# Step 3: Get Client Secret
echo ""
echo "🔑 Retrieving Client Secret..."

CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --region $REGION \
    --query 'UserPoolClient.ClientSecret' \
    --output text)

# Step 4: Save configuration to environment file
echo ""
echo "💾 Saving Cognito configuration..."

cat >> .env.aws << EOF

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_CLIENT_ID=$CLIENT_ID
COGNITO_CLIENT_SECRET=$CLIENT_SECRET
COGNITO_REGION=$REGION
EOF

echo "✅ Configuration saved to .env.aws"

# Step 5: Display summary and next steps
echo ""
echo "🎉 Cognito Setup Complete!"
echo "========================="
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Region: $REGION"
echo ""
echo "🔗 Quick Links:"
echo "Cognito Console: https://ap-south-1.console.aws.amazon.com/cognito/v2/idp/user-pools/$USER_POOL_ID/users"
echo ""
echo "📋 Next Steps:"
echo "1. Review your User Pool settings in AWS Console"
echo "2. Create your first Lambda function for authentication"
echo "3. Set up API Gateway endpoints"
echo "4. Test user registration flow"
echo ""
echo "💰 Current setup cost: ~$0.00 (within free tier limits)"
echo "📊 Monitor costs: https://console.aws.amazon.com/billing/home"
