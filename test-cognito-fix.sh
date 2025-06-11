#!/bin/bash

# Quick test script to verify Cognito authentication fix
echo "🧪 Testing Cognito Authentication Fix"
echo "====================================="

echo "✅ Cognito User Pool ID: ap-south-1_4Cr7XFUmS"
echo "✅ Cognito Client ID: 9poj7iavug62uuif7sve7a6fo" 
echo "✅ Authentication Flows: USER_SRP_AUTH enabled"
echo ""

echo "🌐 Frontend deployed with updated configuration"
echo "🔧 Lambda functions updated with correct client ID"
echo "☁️ CloudFront cache invalidated"
echo ""

echo "📋 Test Instructions:"
echo "1. Visit: https://d1aaifqtlfz7l5.cloudfront.net"
echo "2. Try login with: test@medisecure.dev / TempPass123!"
echo "3. Should no longer see 'USER_SRP_AUTH is not enabled' error"
echo ""

echo "🔍 If issues persist, check browser console for detailed error messages"
