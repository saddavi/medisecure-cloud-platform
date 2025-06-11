#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductionHostingStack } from "./lib/production-hosting-stack";

const app = new cdk.App();

// Custom Domain Configuration for MediSecure Platform
// Deploy with: npx cdk deploy MediSecureCustomDomain --app "npx ts-node cdk-custom-domain.ts"

new ProductionHostingStack(app, "MediSecureCustomDomain", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1", // Certificate Manager requires us-east-1 for CloudFront
  },

  // Custom domain configuration for talharesume.com subdomain
  stage: "production",
  targetRegion: "me-south-1", // Optimized for Qatar market
  useCustomDomain: true,
  baseDomain: "talharesume.com",
  subdomain: "healthcare", // Will create healthcare.talharesume.com

  // Optional: If you already have a hosted zone and certificate
  // hostedZoneId: 'Z1234567890ABC', // Your Route53 hosted zone ID
  // certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/...', // Your existing certificate
});
