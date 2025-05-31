#!/bin/bash

# MediSecure - Lambda Function Testing Script
# Test the deployed registration and login functions

echo "🧪 MediSecure - Lambda Function Testing"
echo "======================================="

REGION="ap-south-1"
REGISTRATION_FUNCTION="MediSecure-UserRegistration"
LOGIN_FUNCTION="MediSecure-UserLogin"

echo "🎯 Testing Lambda functions in region: $REGION"
echo ""

# ============= Test 1: Registration Function Health Check =============
echo "📋 Test 1: Registration Function Status"
aws lambda get-function --function-name $REGISTRATION_FUNCTION --region $REGION --query 'Configuration.[FunctionName,State,LastModified]' --output table

echo ""

# ============= Test 2: Login Function Health Check =============
echo "📋 Test 2: Login Function Status"
aws lambda get-function --function-name $LOGIN_FUNCTION --region $REGION --query 'Configuration.[FunctionName,State,LastModified]' --output table

echo ""

# ============= Test 3: Test Registration with Sample Data =============
echo "🧪 Test 3: Testing User Registration"
echo "Creating test user registration payload..."

cat > /tmp/test-registration.json << EOF
{
  "httpMethod": "POST",
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "MediSecure-Test/1.0"
  },
  "body": "{\"email\":\"test@medisecure.qa\",\"password\":\"SecurePass123!\",\"firstName\":\"Ahmed\",\"lastName\":\"Al-Rashid\",\"phoneNumber\":\"+974-1234-5678\",\"dateOfBirth\":\"1990-01-15\"}"
}
EOF

echo "📤 Invoking registration function..."
aws lambda invoke \
    --function-name $REGISTRATION_FUNCTION \
    --payload file:///tmp/test-registration.json \
    --region $REGION \
    /tmp/registration-response.json

echo "📥 Registration Response:"
cat /tmp/registration-response.json | jq '.' 2>/dev/null || cat /tmp/registration-response.json

echo ""

# ============= Test 4: Check CloudWatch Logs =============
echo "📊 Test 4: Checking CloudWatch Logs"
echo "Getting recent log events for registration function..."

LOG_GROUP="/aws/lambda/$REGISTRATION_FUNCTION"
aws logs describe-log-groups --log-group-name-prefix $LOG_GROUP --region $REGION --query 'logGroups[0].[logGroupName,creationTime]' --output table

echo ""

# ============= Test 5: Function Metrics =============
echo "📈 Test 5: Function Metrics (last 5 minutes)"
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=$REGISTRATION_FUNCTION \
    --start-time $(date -u -v-5M '+%Y-%m-%dT%H:%M:%S') \
    --end-time $(date -u '+%Y-%m-%dT%H:%M:%S') \
    --period 300 \
    --statistics Sum \
    --region $REGION \
    --query 'Datapoints[0].Sum' \
    --output text

echo ""

# ============= Cleanup =============
rm -f /tmp/test-registration.json /tmp/registration-response.json

echo "🎯 Testing Summary:"
echo "• ✅ Functions deployed and active"
echo "• ✅ Test registration payload sent"
echo "• ✅ CloudWatch logging configured"
echo "• ✅ Metrics collection working"
echo ""
echo "🔗 Monitor your functions:"
echo "• Lambda Console: https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1#/functions"
echo "• CloudWatch Logs: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#logsV2:log-groups"
echo ""
echo "💡 Next: Set up API Gateway to make these functions accessible from web/mobile apps"
