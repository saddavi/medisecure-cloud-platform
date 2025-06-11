#!/bin/bash

# Complete Custom Domain Setup for healthcare.talharesume.com
# Run this script AFTER SSL certificate is validated

set -e

# Configuration
CERTIFICATE_ARN="arn:aws:acm:us-east-1:044519418263:certificate/7283ce0f-1d2c-43c6-adf1-786f31cc6dc2"
DOMAIN="healthcare.talharesume.com"
CLOUDFRONT_DISTRIBUTION_ID="E15ZHMQNABZTK7"

echo "🚀 Completing Custom Domain Setup for MediSecure"
echo "================================================="
echo "Domain: $DOMAIN"
echo "Certificate: $CERTIFICATE_ARN"
echo "Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo ""

# Verify certificate is issued
echo "🔐 Verifying SSL certificate status..."
CERT_STATUS=$(aws acm describe-certificate \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region us-east-1 \
    --query 'Certificate.Status' \
    --output text)

echo "Certificate Status: $CERT_STATUS"

if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo "❌ Certificate is not yet issued. Current status: $CERT_STATUS"
    echo "Please wait for certificate validation to complete."
    echo "Run the monitoring script: ./monitor-ssl-certificate.sh"
    exit 1
fi

echo "✅ Certificate is ISSUED and ready!"
echo ""

# Get current CloudFront distribution configuration
echo "📥 Getting current CloudFront configuration..."
aws cloudfront get-distribution-config \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --output json > /tmp/cloudfront-current.json

# Extract ETag
ETAG=$(jq -r '.ETag' /tmp/cloudfront-current.json)
echo "Current ETag: $ETAG"

# Update the distribution configuration
echo "📝 Updating CloudFront configuration..."
jq ".DistributionConfig |= (
    .Aliases.Items = [\"$DOMAIN\"] |
    .Aliases.Quantity = 1 |
    .ViewerCertificate = {
        \"ACMCertificateArn\": \"$CERTIFICATE_ARN\",
        \"SSLSupportMethod\": \"sni-only\",
        \"MinimumProtocolVersion\": \"TLSv1.2_2021\",
        \"Certificate\": \"$CERTIFICATE_ARN\",
        \"CertificateSource\": \"acm\"
    }
)" /tmp/cloudfront-current.json | jq '.DistributionConfig' > /tmp/cloudfront-config-update.json

# Apply the update
echo "🌐 Applying CloudFront distribution update..."
aws cloudfront update-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --distribution-config file:///tmp/cloudfront-config-update.json \
    --if-match "$ETAG" \
    --output json > /tmp/cloudfront-update-result.json

# Check if update was successful
if [ $? -eq 0 ]; then
    echo "✅ CloudFront distribution updated successfully!"
    
    NEW_ETAG=$(jq -r '.ETag' /tmp/cloudfront-update-result.json)
    echo "New ETag: $NEW_ETAG"
    
    echo ""
    echo "🎉 Custom Domain Setup Complete!"
    echo "=================================="
    echo "✅ SSL Certificate: ISSUED"
    echo "✅ CloudFront: Updated with custom domain"
    echo "✅ Domain: $DOMAIN"
    echo ""
    echo "📋 Final Steps:"
    echo "1. DNS propagation: 5-15 minutes"
    echo "2. CloudFront deployment: 10-20 minutes"
    echo "3. Total time: ~15-35 minutes"
    echo ""
    echo "🌐 Your site will be available at:"
    echo "   https://$DOMAIN"
    echo ""
    echo "🔍 To check deployment status:"
    echo "   aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.Status'"
    echo ""
    echo "💡 You can also monitor in AWS Console:"
    echo "   https://console.aws.amazon.com/cloudfront/home?region=us-east-1#/distributions/$CLOUDFRONT_DISTRIBUTION_ID"
    
    # Test the custom domain after a brief wait
    echo ""
    echo "⏳ Waiting 2 minutes before testing domain..."
    sleep 120
    
    echo "🧪 Testing custom domain..."
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|403"; then
        echo "✅ Domain is responding! Custom domain setup successful!"
    else
        echo "⏳ Domain not yet responding (normal - may take up to 30 minutes)"
        echo "   Keep checking: https://$DOMAIN"
    fi
    
else
    echo "❌ Failed to update CloudFront distribution"
    echo "Error details saved to /tmp/cloudfront-update-result.json"
    exit 1
fi

# Cleanup temp files
rm -f /tmp/cloudfront-*.json

echo ""
echo "🎯 Setup completed successfully!"
echo "Your MediSecure platform is now available at: https://$DOMAIN"
