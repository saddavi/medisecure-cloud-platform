#!/bin/bash

# MediSecure AWS Quick Access Script
# Run this to quickly configure AWS and open console

echo "🏥 MediSecure Cloud Platform - AWS Quick Setup"
echo "================================================"

# Set AWS Configuration
echo "📍 Setting AWS region to Mumbai (ap-south-1)..."
aws configure set region ap-south-1
aws configure set output json

# Verify connection
echo "🔗 Verifying AWS connection..."
aws sts get-caller-identity

echo ""
echo "✅ AWS Configuration Complete!"
echo ""
echo "🌐 Quick Console Links:"
echo "├── Main Console: https://ap-south-1.console.aws.amazon.com/console/home?region=ap-south-1"
echo "├── Lambda: https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1"
echo "├── Cognito: https://ap-south-1.console.aws.amazon.com/cognito/home?region=ap-south-1"
echo "├── RDS: https://ap-south-1.console.aws.amazon.com/rds/home?region=ap-south-1"
echo "├── S3: https://s3.console.aws.amazon.com/s3/home?region=ap-south-1"
echo "└── CloudWatch: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1"
echo ""

# Option to open main console
read -p "🚀 Open AWS Console in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Opening AWS Console..."
    open "https://ap-south-1.console.aws.amazon.com/console/home?region=ap-south-1"
fi

echo "🎯 Ready for MediSecure development in Mumbai region!"
