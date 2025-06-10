// Integration Test Utilities
// Testing AWS services connectivity

import { apiService } from "@/services/api";
import { amplifyAuthService } from "@/services/amplifyAuth";
import { awsConfig } from "@/config/aws";

export interface IntegrationTestResult {
  service: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: any;
}

/**
 * Test AWS configuration loading
 */
export async function testAWSConfig(): Promise<IntegrationTestResult> {
  try {
    console.log("Testing AWS Configuration...", awsConfig);

    if (!awsConfig.cognito.userPoolId) {
      return {
        service: "AWS Config",
        status: "error",
        message: "Missing Cognito User Pool ID",
      };
    }

    if (!awsConfig.apiGateway.baseUrl) {
      return {
        service: "AWS Config",
        status: "error",
        message: "Missing API Gateway URL",
      };
    }

    return {
      service: "AWS Config",
      status: "success",
      message: "AWS configuration loaded successfully",
      details: {
        region: awsConfig.region,
        environment: awsConfig.app.environment,
        userPoolId: awsConfig.cognito.userPoolId,
        apiGatewayUrl: awsConfig.apiGateway.baseUrl,
      },
    };
  } catch (error: any) {
    return {
      service: "AWS Config",
      status: "error",
      message: `Configuration error: ${error.message}`,
    };
  }
}

/**
 * Test API Gateway connectivity
 */
export async function testAPIGateway(): Promise<IntegrationTestResult> {
  try {
    console.log("Testing API Gateway connectivity...");

    const isHealthy = await apiService.healthCheck();

    if (isHealthy) {
      return {
        service: "API Gateway",
        status: "success",
        message: "API Gateway is accessible",
      };
    } else {
      return {
        service: "API Gateway",
        status: "warning",
        message: "API Gateway health check failed - may not be fully deployed",
      };
    }
  } catch (error: any) {
    return {
      service: "API Gateway",
      status: "error",
      message: `API Gateway error: ${error.message}`,
    };
  }
}

/**
 * Test Amplify/Cognito initialization
 */
export async function testAmplifyAuth(): Promise<IntegrationTestResult> {
  try {
    console.log("Testing Amplify Auth initialization...");

    const isAuthenticated = await amplifyAuthService.isAuthenticated();

    return {
      service: "Amplify Auth",
      status: "success",
      message: `Amplify initialized successfully. User authenticated: ${isAuthenticated}`,
      details: {
        isAuthenticated,
      },
    };
  } catch (error: any) {
    return {
      service: "Amplify Auth",
      status: "error",
      message: `Amplify error: ${error.message}`,
    };
  }
}

/**
 * Run all integration tests
 */
export async function runIntegrationTests(): Promise<IntegrationTestResult[]> {
  console.log("🔬 Running MediSecure Integration Tests...");

  const results: IntegrationTestResult[] = [];

  // Test AWS Configuration
  results.push(await testAWSConfig());

  // Test Amplify Auth
  results.push(await testAmplifyAuth());

  // Test API Gateway
  results.push(await testAPIGateway());

  console.log("✅ Integration tests completed:", results);
  return results;
}

// Make tests available globally for browser console
if (typeof window !== "undefined") {
  (window as any).medisecureTests = {
    runIntegrationTests,
    testAWSConfig,
    testAPIGateway,
    testAmplifyAuth,
  };
}
