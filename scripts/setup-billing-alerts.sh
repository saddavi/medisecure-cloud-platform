#!/bin/bash

# MediSecure Cloud Platform - AWS Billing Alerts Setup
# This script sets up comprehensive billing monitoring and alerts

echo "🏥 MediSecure - AWS Billing & Cost Management Setup"
echo "=================================================="

# Configuration
EMAIL="saddavi@live.com"  # Replace with your email
PROJECT_NAME="MediSecure"
REGION="us-east-1"  # Billing metrics only available in us-east-1
ALERT_THRESHOLDS=(3 6 9 12 15 18 21)  # Alert every $3 up to $21

echo "📧 Email for alerts: $EMAIL"
echo "🎯 Alert thresholds: ${ALERT_THRESHOLDS[*]} USD"
echo ""

# Step 1: Create SNS Topic for billing alerts
echo "📢 Creating SNS topic for billing alerts..."
TOPIC_ARN=$(aws sns create-topic \
    --name "${PROJECT_NAME}-BillingAlerts" \
    --region $REGION \
    --query 'TopicArn' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ SNS Topic created: $TOPIC_ARN"
else
    echo "❌ Failed to create SNS topic"
    exit 1
fi

# Step 2: Subscribe email to the topic
echo "📧 Subscribing $EMAIL to billing alerts..."
aws sns subscribe \
    --topic-arn $TOPIC_ARN \
    --protocol email \
    --notification-endpoint $EMAIL \
    --region $REGION

echo "⚠️  IMPORTANT: Check your email and confirm the subscription!"
echo ""

# Step 3: Create billing alarms for each threshold
echo "⏰ Creating billing alarms..."

for threshold in "${ALERT_THRESHOLDS[@]}"; do
    echo "  Setting up alarm for \$$threshold..."
    
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-BillingAlert-${threshold}USD" \
        --alarm-description "MediSecure project billing alert for \$${threshold}" \
        --metric-name EstimatedCharges \
        --namespace AWS/Billing \
        --statistic Maximum \
        --period 86400 \
        --threshold $threshold \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=Currency,Value=USD \
        --evaluation-periods 1 \
        --alarm-actions $TOPIC_ARN \
        --region $REGION
    
    if [ $? -eq 0 ]; then
        echo "    ✅ Alarm created for \$$threshold"
    else
        echo "    ❌ Failed to create alarm for \$$threshold"
    fi
done

echo ""
echo "🎯 Next Steps:"
echo "1. Check your email and CONFIRM the subscription"
echo "2. Go to AWS Console > Billing > Billing Preferences"
echo "3. Enable 'Receive Billing Alerts'"
echo "4. Verify alarms in CloudWatch console"
echo ""
echo "📊 View your setup:"
echo "- Billing Console: https://console.aws.amazon.com/billing/home"
echo "- CloudWatch Alarms: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:"
echo "- SNS Topics: https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/topics"
echo ""
echo "💡 Pro Tip: AWS billing data updates once per day, so alerts may have a 24-hour delay"
