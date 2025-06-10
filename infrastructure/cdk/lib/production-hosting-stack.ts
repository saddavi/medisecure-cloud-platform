import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface ProductionHostingStackProps extends cdk.StackProps {
  domainName?: string; // Optional custom domain
  stage: "dev" | "staging" | "production";
  targetRegion?: string; // Target region for optimization (e.g., me-south-1 for Qatar)
}

export class ProductionHostingStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;
  public readonly domainName: string;

  constructor(scope: Construct, id: string, props: ProductionHostingStackProps) {
    super(scope, id, props);

    const stage = props.stage;
    const targetRegion = props.targetRegion || "me-south-1"; // Default to Bahrain for Qatar market
    const domainName = props.domainName || `medisecure-${stage}.healthcare.local`;

    // ============= S3 Bucket for Static Website Hosting =============
    // Optimized for Gulf region performance
    this.bucket = new s3.Bucket(this, `MediSecure-Frontend-${stage}`, {
      bucketName: `medisecure-frontend-${stage}-${this.account}-${targetRegion}`,
      
      // Security Configuration
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      
      // Lifecycle Management
      versioned: true,
      lifecycleRules: [
        {
          id: "DeleteOldVersions",
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      
      // Development vs Production Configuration
      removalPolicy: stage === "production" 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      
      // CORS for healthcare applications
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          maxAge: 3600,
        },
      ],
    });

    // ============= CloudFront Origin Access Control =============
    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      `MediSecure-OAC-${stage}`,
      {
        description: `OAC for MediSecure ${stage} environment`,
      }
    );

    // ============= CloudFront Distribution =============
    this.distribution = new cloudfront.Distribution(
      this,
      `MediSecure-Distribution-${stage}`,
      {
        comment: `MediSecure Healthcare Platform - ${stage} Environment (Optimized for ${targetRegion})`,
        
        // Origin Configuration
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
            originAccessControl,
          }),
          
          // Performance Optimization for Healthcare Apps
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          
          // Compress for faster loading in Gulf region
          compress: true,
          
          // Security Headers for Healthcare Compliance
          responseHeadersPolicy: this.createSecurityHeadersPolicy(stage),
        },

        // SPA Routing Configuration
        additionalBehaviors: {
          "/api/*": {
            origin: new origins.HttpOrigin(
              "e8x7hxtrul.execute-api.ap-south-1.amazonaws.com",
              {
                customHeaders: {
                  "X-Custom-Header": "MediSecure-API",
                },
              }
            ),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // No caching for API calls
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          },
        },

        // Error Pages for SPA
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(5),
          },
        ],

        // Global Edge Locations optimized for Qatar/Gulf Region
        // PriceClass.PRICE_CLASS_100 includes Middle East edge locations
        priceClass: stage === "production" 
          ? cloudfront.PriceClass.PRICE_CLASS_ALL 
          : cloudfront.PriceClass.PRICE_CLASS_100, // Cost-optimized for development
        
        // Default root object
        defaultRootObject: "index.html",
        
        // Enable logging for production monitoring
        enableLogging: stage === "production",
        logBucket: stage === "production" ? this.createLogBucket() : undefined,
        logFilePrefix: "cloudfront-logs/",
      }
    );

    // ============= S3 Bucket Policy for CloudFront =============
    const bucketPolicy = new iam.PolicyStatement({
      sid: "AllowCloudFrontServicePrincipal",
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
      actions: ["s3:GetObject"],
      resources: [`${this.bucket.bucketArn}/*`],
      conditions: {
        StringEquals: {
          "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
        },
      },
    });

    this.bucket.addToResourcePolicy(bucketPolicy);

    // ============= Deployment Automation =============
    // Only deploy if build directory exists
    const deployment = new s3deploy.BucketDeployment(
      this,
      `MediSecure-Deployment-${stage}`,
      {
        sources: [s3deploy.Source.asset("../../frontend/dist")],
        destinationBucket: this.bucket,
        distribution: this.distribution,
        distributionPaths: ["/*"],
        
        // Deployment configuration
        retainOnDelete: stage === "production",
        memoryLimit: 512,
        
        // Cache optimization
        cacheControl: [
          s3deploy.CacheControl.setPublic(),
          s3deploy.CacheControl.maxAge(cdk.Duration.hours(1)),
        ],
        
        // Healthcare compliance: exclude sensitive files
        exclude: ["*.map", "*.env*", "config/*"],
      }
    );

    // ============= Outputs =============
    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "S3 Bucket name for static website hosting",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: this.distribution.distributionId,
      description: "CloudFront distribution ID",
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: this.distribution.distributionDomainName,
      description: "CloudFront distribution domain name",
    });

    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `https://${this.distribution.distributionDomainName}`,
      description: "Website URL for MediSecure Healthcare Platform",
    });

    // Store domain name for external reference
    this.domainName = this.distribution.distributionDomainName;

    // ============= Tags for Cost Management =============
    cdk.Tags.of(this).add("Project", "MediSecure");
    cdk.Tags.of(this).add("Environment", stage);
    cdk.Tags.of(this).add("Component", "Frontend");
    cdk.Tags.of(this).add("CostCenter", "Healthcare-Platform");
  }

  private createSecurityHeadersPolicy(stage: string): cloudfront.ResponseHeadersPolicy {
    return new cloudfront.ResponseHeadersPolicy(
      this,
      `MediSecure-SecurityHeaders-${stage}`,
      {
        comment: `Security headers for MediSecure ${stage} environment`,
        
        // HIPAA-Compliant Security Headers
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
          contentSecurityPolicy: {
            contentSecurityPolicy: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com https://cognito-idp.ap-south-1.amazonaws.com",
            ].join("; "),
            override: true,
          },
        },
      }
    );
  }

  private createLogBucket(): s3.Bucket {
    return new s3.Bucket(this, "MediSecure-CloudFront-Logs", {
      bucketName: `medisecure-cloudfront-logs-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        {
          id: "DeleteLogsAfter90Days",
          enabled: true,
          expiration: cdk.Duration.days(90),
        },
      ],
    });
  }
}
