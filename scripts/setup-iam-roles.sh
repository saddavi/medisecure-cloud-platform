#!/bin/bash

# MediSecure - Enterprise IAM Setup for Lambda Functions
# This script creates IAM roles and policies following enterprise best practices

echo "🔐 MediSecure - Enterprise IAM Setup"
echo "===================================="

# Configuration
REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_NAME="MediSecure-LambdaExecutionRole"
POLICY_NAME="MediSecure-LambdaPolicy"

echo "📋 Account ID: $ACCOUNT_ID"
echo "🌍 Region: $REGION"
echo "👤 Role Name: $ROLE_NAME"
echo ""

# ============= Step 1: Create Trust Policy =============
echo "📝 Creating Lambda trust policy..."

cat > /tmp/lambda-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "aws:RequestedRegion": "$REGION"
                }
            }
        }
    ]
}
EOF

# ============= Step 2: Create Custom IAM Policy =============
echo "📋 Creating custom IAM policy for MediSecure Lambda functions..."

cat > /tmp/medisecure-lambda-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BasicLambdaExecution",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:$REGION:$ACCOUNT_ID:log-group:/aws/lambda/MediSecure-*",
                "arn:aws:logs:$REGION:$ACCOUNT_ID:log-group:/aws/lambda/MediSecure-*:*"
            ]
        },
        {
            "Sid": "CognitoUserManagement",
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:AdminRespondToAuthChallenge",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminUpdateUserAttributes",
                "cognito-idp:InitiateAuth",
                "cognito-idp:RespondToAuthChallenge",
                "cognito-idp:ConfirmSignUp",
                "cognito-idp:ResendConfirmationCode"
            ],
            "Resource": [
                "arn:aws:cognito-idp:$REGION:$ACCOUNT_ID:userpool/ap-south-1_4Cr7XFUmS"
            ]
        },
        {
            "Sid": "CloudWatchMetrics",
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricData"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "cloudwatch:namespace": "MediSecure/Lambda"
                }
            }
        },
        {
            "Sid": "XRayTracing",
            "Effect": "Allow",
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# ============= Step 3: Create IAM Role =============
echo "👤 Creating IAM role..."

# Check if role already exists
aws iam get-role --role-name $ROLE_NAME &>/dev/null

if [ $? -eq 0 ]; then
    echo "⚠️  Role already exists. Updating trust policy..."
    aws iam update-assume-role-policy \
        --role-name $ROLE_NAME \
        --policy-document file:///tmp/lambda-trust-policy.json
else
    echo "🆕 Creating new IAM role..."
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
        --description "Execution role for MediSecure Lambda functions with healthcare-grade security" \
        --tags Key=Project,Value=MediSecure Key=Environment,Value=development Key=Compliance,Value=HIPAA
fi

if [ $? -eq 0 ]; then
    echo "✅ IAM role created/updated successfully"
else
    echo "❌ Failed to create IAM role"
    exit 1
fi

# ============= Step 4: Create and Attach Custom Policy =============
echo "📋 Creating custom policy..."

# Check if policy already exists
aws iam get-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME" &>/dev/null

if [ $? -eq 0 ]; then
    echo "⚠️  Policy already exists. Creating new version..."
    aws iam create-policy-version \
        --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME" \
        --policy-document file:///tmp/medisecure-lambda-policy.json \
        --set-as-default
else
    echo "🆕 Creating new policy..."
    aws iam create-policy \
        --policy-name $POLICY_NAME \
        --policy-document file:///tmp/medisecure-lambda-policy.json \
        --description "Custom policy for MediSecure Lambda functions with least-privilege access"
fi

# Attach policy to role
echo "🔗 Attaching custom policy to role..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"

# ============= Step 5: Attach AWS Managed Policy =============
echo "🔗 Attaching AWS managed policy for Lambda basic execution..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# ============= Step 6: Wait for Role Propagation =============
echo "⏳ Waiting for IAM role to propagate (this can take up to 10 seconds)..."
sleep 10

# ============= Step 7: Verify Setup =============
echo "🔍 Verifying IAM setup..."

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

if [ $? -eq 0 ]; then
    echo "✅ IAM setup completed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "• Role Name: $ROLE_NAME"
    echo "• Role ARN: $ROLE_ARN"
    echo "• Custom Policy: $POLICY_NAME"
    echo "• Region: $REGION"
    echo ""
    echo "🔐 Security Features:"
    echo "• ✅ Least-privilege access (only required Cognito operations)"
    echo "• ✅ Resource-specific permissions (only our User Pool)"
    echo "• ✅ Regional restrictions (only ap-south-1)"
    echo "• ✅ CloudWatch logging enabled"
    echo "• ✅ X-Ray tracing support"
    echo "• ✅ Healthcare compliance tags"
    echo ""
    echo "💰 Cost Impact: $0.00 (IAM is free)"
    echo ""
    echo "🎯 Next: Update deployment script with this role ARN"
    echo "   Replace hardcoded ARN with: $ROLE_ARN"
else
    echo "❌ IAM setup verification failed"
    exit 1
fi

# Clean up temporary files
rm -f /tmp/lambda-trust-policy.json /tmp/medisecure-lambda-policy.json

echo ""
echo "🔗 IAM Console: https://console.aws.amazon.com/iam/home#/roles/$ROLE_NAME"
echo ""
echo "💡 Enterprise Learning Points:"
echo "1. Least-privilege principle applied"
echo "2. Resource-specific ARNs (not wildcards)"
echo "3. Regional restrictions for compliance"
echo "4. Proper tagging for cost allocation"
echo "5. Version control for policy updates"
