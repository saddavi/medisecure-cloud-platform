#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MediSecureStack } from "../lib/cdk-stack";
import { ProductionHostingStack } from "../lib/production-hosting-stack";

const app = new cdk.App();

// Get environment context
const stage = app.node.tryGetContext("stage") || "dev";
const region = app.node.tryGetContext("region") || "me-south-1";

// Backend Infrastructure Stack (API + Database)
const backendStack = new MediSecureStack(app, "MediSecure-Backend", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: region,
  },
  description: "MediSecure Healthcare Platform - Backend API and Database",
  tags: {
    Project: "MediSecure",
    Environment: stage,
    Component: "Backend",
    Compliance: "HIPAA",
    CostCenter: "Healthcare-IT",
  },
});

// Production Hosting Stack (Frontend + CloudFront)
// Note: Certificate must be in us-east-1 for CloudFront, but optimized for Gulf region
const hostingStack = new ProductionHostingStack(app, "MediSecure-Hosting", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1", // Required by AWS for CloudFront certificates
  },
  stage: stage as "dev" | "staging" | "production",
  targetRegion: "me-south-1", // Optimize for Bahrain/Qatar market
  description:
    "MediSecure Healthcare Platform - Frontend Hosting optimized for Gulf region",
  tags: {
    Project: "MediSecure",
    Environment: stage,
    Component: "Frontend",
    Compliance: "HIPAA",
    CostCenter: "Healthcare-IT",
    TargetMarket: "Qatar-Bahrain",
  },
});

// Add dependency - hosting needs backend APIs to be deployed first
hostingStack.addDependency(backendStack);
