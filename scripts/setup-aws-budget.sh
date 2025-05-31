#!/bin/bash

# MediSecure - AWS Budget Setup (Alternative to hard caps)
# This creates an AWS Budget with more advanced controls

echo "💰 MediSecure - AWS Budget Setup"
echo "================================"

EMAIL="saddavi@live.com"
BUDGET_NAME="MediSecure-Monthly-Budget"
BUDGET_AMOUNT="20"
REGION="us-east-1"

echo "📊 Creating AWS Budget with $BUDGET_AMOUNT USD limit..."

# Create the budget JSON configuration
cat > /tmp/budget.json << EOF
{
    "BudgetName": "$BUDGET_NAME",
    "BudgetLimit": {
        "Amount": "$BUDGET_AMOUNT",
        "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST",
    "CostFilters": {
        "Service": ["Amazon Elastic Compute Cloud - Compute", "Amazon Simple Storage Service", "Amazon Relational Database Service", "AWS Lambda", "Amazon Cognito", "Amazon API Gateway", "Amazon CloudWatch", "Amazon Simple Notification Service", "AWS IoT Core"]
    }
}
EOF

# Create notifications JSON
cat > /tmp/notifications.json << EOF
[
    {
        "Notification": {
            "NotificationType": "ACTUAL",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 75,
            "ThresholdType": "PERCENTAGE"
        },
        "Subscribers": [
            {
                "SubscriptionType": "EMAIL",
                "Address": "$EMAIL"
            }
        ]
    },
    {
        "Notification": {
            "NotificationType": "ACTUAL",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 90,
            "ThresholdType": "PERCENTAGE"
        },
        "Subscribers": [
            {
                "SubscriptionType": "EMAIL",
                "Address": "$EMAIL"
            }
        ]
    },
    {
        "Notification": {
            "NotificationType": "FORECASTED",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 100,
            "ThresholdType": "PERCENTAGE"
        },
        "Subscribers": [
            {
                "SubscriptionType": "EMAIL",
                "Address": "$EMAIL"
            }
        ]
    }
]
EOF

# Create the budget
aws budgets create-budget \
    --account-id $(aws sts get-caller-identity --query Account --output text) \
    --budget file:///tmp/budget.json \
    --notifications-with-subscribers file:///tmp/notifications.json

if [ $? -eq 0 ]; then
    echo "✅ AWS Budget created successfully!"
    echo "📊 Budget: $BUDGET_AMOUNT USD per month"
    echo "🔔 Alerts at: 75%, 90%, and 100% (forecasted)"
    echo ""
    echo "💰 Cost: $0.02 per day (~$0.60/month) for the budget service"
else
    echo "❌ Failed to create budget"
    echo "💡 This might be due to permissions or existing budget limits"
fi

# Cleanup temp files
rm -f /tmp/budget.json /tmp/notifications.json

echo ""
echo "🎯 View your budget:"
echo "https://console.aws.amazon.com/billing/home#/budgets"
