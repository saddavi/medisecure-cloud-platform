#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MediSecureStack } from "../lib/cdk-stack";

const app = new cdk.App();
new MediSecureStack(app, "MediSecureStack", {
  /* Deploy to the current AWS account and region */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  /* Stack description */
  description:
    "MediSecure Healthcare Platform - Database and API Infrastructure",

  /* Tags for compliance and cost tracking */
  tags: {
    Project: "MediSecure",
    Environment: "Development",
    Compliance: "HIPAA",
    CostCenter: "Healthcare-IT",
  },
});
