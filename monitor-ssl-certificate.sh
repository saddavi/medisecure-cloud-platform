#!/bin/bash

# SSL Certificate Monitoring Script for healthcare.talharesume.com
# Run this script to monitor certificate validation progress

set -e

# Certificate configuration
CERTIFICATE_ARN="arn:aws:acm:us-east-1:044519418263:certificate/7283ce0f-1d2c-43c6-adf1-786f31cc6dc2"
DOMAIN="healthcare.talharesume.com"
CLOUDFRONT_DISTRIBUTION_ID="E15ZHMQNABZTK7"

echo "🔍 SSL Certificate Monitoring for healthcare.talharesume.com"
echo "=================================================="
echo "Certificate ARN: $CERTIFICATE_ARN"
echo "Domain: $DOMAIN"
echo "Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
echo ""

# Function to check DNS propagation
check_dns() {
    echo "📡 Checking DNS validation records..."
    
    echo "Checking record 1..."
    if dig +short _3a6800305247dbe7915bcee4b95d44b5.healthcare.talharesume.com CNAME | grep -q "xlfgrmvvlj.acm-validations.aws"; then
        echo "✅ DNS record 1 is propagated"
    else
        echo "❌ DNS record 1 not found or not propagated yet"
    fi
    
    echo "Checking record 2..."
    if dig +short _baa3e04f0621ca997aca0394426d17df.www.healthcare.talharesume.com CNAME | grep -q "xlfgrmvvlj.acm-validations.aws"; then
        echo "✅ DNS record 2 is propagated"
    else
        echo "❌ DNS record 2 not found or not propagated yet"
    fi
    echo ""
}

# Function to check certificate status
check_certificate() {
    echo "🔐 Checking SSL certificate status..."
    
    STATUS=$(aws acm describe-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region us-east-1 \
        --query 'Certificate.Status' \
        --output text)
    
    echo "Certificate Status: $STATUS"
    
    if [ "$STATUS" = "ISSUED" ]; then
        echo "🎉 Certificate is ISSUED and ready to use!"
        return 0
    elif [ "$STATUS" = "PENDING_VALIDATION" ]; then
        echo "⏳ Certificate is pending validation..."
        return 1
    else
        echo "❌ Certificate status: $STATUS"
        return 1
    fi
}

# Function to update CloudFront distribution
update_cloudfront() {
    echo "🌐 Updating CloudFront distribution..."
    
    # Get current distribution config
    aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'DistributionConfig' > /tmp/cloudfront-config.json
    
    # Extract ETag
    ETAG=$(aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'ETag' \
        --output text)
    
    echo "Current ETag: $ETAG"
    
    # Update the config with custom domain and certificate
    cat > /tmp/cloudfront-update.json << EOF
{
    "DistributionConfig": $(cat /tmp/cloudfront-config.json | jq ".Aliases.Items = [\"$DOMAIN\"] | .Aliases.Quantity = 1 | .ViewerCertificate.ACMCertificateArn = \"$CERTIFICATE_ARN\" | .ViewerCertificate.SSLSupportMethod = \"sni-only\" | .ViewerCertificate.MinimumProtocolVersion = \"TLSv1.2_2021\" | .ViewerCertificate.Certificate = \"$CERTIFICATE_ARN\" | .ViewerCertificate.CertificateSource = \"acm\" | del(.ViewerCertificate.CloudFrontDefaultCertificate)")
}
EOF
    
    echo "Updated configuration prepared"
    echo "Ready to update CloudFront distribution"
    
    return 0
}

# Main monitoring loop
main() {
    echo "Starting SSL certificate monitoring..."
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    while true; do
        echo "$(date): Checking certificate status..."
        
        check_dns
        
        if check_certificate; then
            echo ""
            echo "🎉 SSL Certificate is ready!"
            echo "Now updating CloudFront distribution..."
            
            if update_cloudfront; then
                echo "✅ CloudFront update configuration prepared"
                echo ""
                echo "📋 Next steps:"
                echo "1. Certificate is validated and ready"
                echo "2. Run the CloudFront update command"
                echo "3. Custom domain will be live!"
                echo ""
                echo "To complete CloudFront update, run:"
                echo "aws cloudfront update-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --distribution-config file:///tmp/cloudfront-update.json --if-match \$ETAG"
            fi
            break
        fi
        
        echo "⏳ Waiting 30 seconds before next check..."
        sleep 30
        echo ""
    done
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
