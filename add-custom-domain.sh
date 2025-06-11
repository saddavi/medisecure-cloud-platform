#!/bin/bash

# Script to add custom domain alias to existing CloudFront distribution
echo "🌐 Adding healthcare.talharesume.com to CloudFront Distribution"
echo "============================================================="

DISTRIBUTION_ID="E15ZHMQNABZTK7"
CUSTOM_DOMAIN="healthcare.talharesume.com"

echo "📋 Distribution ID: $DISTRIBUTION_ID"
echo "🔗 Adding alias: $CUSTOM_DOMAIN"
echo ""

# Get current configuration
echo "1️⃣ Getting current CloudFront configuration..."
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json > /tmp/current-config.json

# Extract ETag for update
ETAG=$(cat /tmp/current-config.json | jq -r '.ETag')
echo "📝 Current ETag: $ETAG"

# Extract the DistributionConfig and modify it
echo "2️⃣ Modifying configuration to add custom domain..."
cat /tmp/current-config.json | jq '.DistributionConfig' > /tmp/base-config.json

# Add the custom domain alias
cat /tmp/base-config.json | jq --arg domain "$CUSTOM_DOMAIN" '
.Aliases = {
  "Quantity": 1,
  "Items": [$domain]
}' > /tmp/updated-config.json

echo "3️⃣ Updated configuration:"
echo "   - Aliases: $(cat /tmp/updated-config.json | jq -r '.Aliases.Items[]')"
echo ""

# Update the distribution
echo "4️⃣ Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id $DISTRIBUTION_ID \
    --distribution-config file:///tmp/updated-config.json \
    --if-match $ETAG

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CloudFront distribution updated successfully!"
    echo "⏳ Note: It may take 5-15 minutes for changes to propagate globally"
    echo ""
    echo "🧪 Test your domain:"
    echo "   https://$CUSTOM_DOMAIN"
    echo ""
else
    echo "❌ Failed to update CloudFront distribution"
    exit 1
fi

# Cleanup
rm -f /tmp/current-config.json /tmp/base-config.json /tmp/updated-config.json

echo "🎉 Custom domain setup complete!"
