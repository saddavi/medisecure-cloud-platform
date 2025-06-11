#!/bin/bash

echo "🔒 Monitoring SSL Certificate Deployment for healthcare.talharesume.com"
echo "=================================================="

# Function to check certificate status
check_certificate() {
    echo "⏳ Checking for SSL certificate..."
    aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?contains(DomainName, 'healthcare')]" --output table
}

# Function to check CloudFront distributions
check_cloudfront() {
    echo "☁️ Checking CloudFront distributions..."
    aws cloudfront list-distributions --query "DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status,Aliases:Aliases.Items}" --output table
}

# Function to get certificate details if found
get_certificate_details() {
    CERT_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?contains(DomainName, 'healthcare')].CertificateArn" --output text)
    
    if [ ! -z "$CERT_ARN" ]; then
        echo "📋 Certificate Details:"
        aws acm describe-certificate --region us-east-1 --certificate-arn $CERT_ARN --query "Certificate.{Status:Status,DomainName:DomainName,ValidationRecords:DomainValidationOptions}" --output table
        
        echo "🔑 DNS Validation Records Needed:"
        aws acm describe-certificate --region us-east-1 --certificate-arn $CERT_ARN --query "Certificate.DomainValidationOptions[].ResourceRecord" --output table
    fi
}

echo "Starting monitoring..."
check_certificate
check_cloudfront

# If certificate exists, show details
CERT_COUNT=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?contains(DomainName, 'healthcare')]" --output text | wc -l)

if [ $CERT_COUNT -gt 0 ]; then
    echo "✅ Certificate found! Getting details..."
    get_certificate_details
else
    echo "⏳ Certificate not yet created. Deployment still in progress..."
fi

echo "=================================================="
echo "Run this script again in a few minutes to check progress"
