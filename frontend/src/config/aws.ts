// MediSecure Cloud Platform - AWS Configuration
// Healthcare-grade AWS Amplify and Cognito configuration

export const awsConfig = {
  // AWS Region Configuration
  region: "ap-south-1", // Mumbai region (closest to Qatar)

  // API Gateway Configuration
  apiGateway: {
    baseUrl: "https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com",
    endpoints: {
      auth: {
        register: "/auth/register",
        login: "/auth/login",
      },
      patients: {
        base: "/patients",
        byId: (id: string) => `/patients/${id}`,
      },
    },
  },

  // AWS Cognito Configuration
  cognito: {
    userPoolId: "ap-south-1_4Cr7XFUmS",
    userPoolWebClientId: "34oik0kokq9l20kiqs3kvth2li",
    region: "ap-south-1",

    // Authentication configuration
    authenticationFlowType: "USER_PASSWORD_AUTH",

    // Token configuration
    tokenRefreshThreshold: 300000, // 5 minutes in milliseconds

    // Session configuration
    sessionTimeout: 3600000, // 1 hour in milliseconds
  },

  // Application Configuration
  app: {
    name: "MediSecure Cloud Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",

    // Healthcare-specific settings
    compliance: {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes for healthcare compliance
      autoLogout: true,
      auditLogging: true,
    },

    // UI/UX Configuration
    ui: {
      theme: "medical",
      locale: "en-US",
      timezone: "Asia/Qatar",
    },
  },
};

// AWS Amplify Configuration
export const amplifyConfig = {
  Auth: {
    region: awsConfig.cognito.region,
    userPoolId: awsConfig.cognito.userPoolId,
    userPoolWebClientId: awsConfig.cognito.userPoolWebClientId,
    authenticationFlowType: awsConfig.cognito.authenticationFlowType,

    // OAuth configuration (for future social login)
    oauth: {
      domain: "", // Will be configured when OAuth is needed
      scope: ["email", "profile", "openid"],
      redirectSignIn: window.location.origin,
      redirectSignOut: window.location.origin,
      responseType: "code",
    },
  },

  // API Configuration
  API: {
    endpoints: [
      {
        name: "MediSecureAPI",
        endpoint: awsConfig.apiGateway.baseUrl,
        region: awsConfig.region,
      },
    ],
  },
};

// Environment-specific overrides
if (awsConfig.app.environment === "production") {
  // Production-specific configurations
  amplifyConfig.Auth.oauth.domain = "auth.medisecure.com"; // Example production domain
}

export default awsConfig;
