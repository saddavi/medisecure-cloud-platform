// MediSecure Cloud Platform - AWS Configuration
// Healthcare-grade AWS Amplify and Cognito configuration

// Environment variables with fallbacks for Vite
const getEnvVar = (key: keyof ImportMetaEnv, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

export const awsConfig = {
  // AWS Region Configuration
  region: getEnvVar("VITE_AWS_REGION", "ap-south-1"), // Mumbai region (closest to Qatar)

  // API Gateway Configuration
  apiGateway: {
    baseUrl: getEnvVar(
      "VITE_API_GATEWAY_BASE_URL",
      "https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com/dev"
    ),
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
    userPoolId: getEnvVar("VITE_AWS_USER_POOL_ID", "ap-south-1_4Cr7XFUmS"),
    userPoolWebClientId: getEnvVar(
      "VITE_AWS_USER_POOL_WEB_CLIENT_ID",
      "34oik0kokq9l20kiqs3kvth2li"
    ),
    region: getEnvVar("VITE_AWS_REGION", "ap-south-1"),

    // Authentication configuration
    authenticationFlowType: "USER_PASSWORD_AUTH",

    // Token configuration
    tokenRefreshThreshold: 300000, // 5 minutes in milliseconds

    // Session configuration
    sessionTimeout:
      parseInt(getEnvVar("VITE_SESSION_TIMEOUT_MINUTES", "30")) * 60 * 1000, // Convert minutes to milliseconds
  },

  // Application Configuration
  app: {
    name: getEnvVar("VITE_APP_NAME", "MediSecure Cloud Platform"),
    version: getEnvVar("VITE_APP_VERSION", "1.0.0"),
    environment: getEnvVar("VITE_APP_ENVIRONMENT", "development"),

    // Healthcare-specific settings
    compliance: {
      sessionTimeout:
        parseInt(getEnvVar("VITE_SESSION_TIMEOUT_MINUTES", "30")) * 60 * 1000, // 30 minutes for healthcare compliance
      autoLogout: getEnvVar("VITE_AUTO_LOGOUT_ENABLED", "true") === "true",
      auditLogging: getEnvVar("VITE_AUDIT_LOGGING_ENABLED", "true") === "true",
    },

    // UI/UX Configuration
    ui: {
      theme: "medical",
      locale: "en-US",
      timezone: "Asia/Qatar",
    },

    // Debug configuration
    debug: {
      enabled: getEnvVar("VITE_DEBUG_MODE", "false") === "true",
      logLevel: getEnvVar("VITE_LOG_LEVEL", "error") as
        | "debug"
        | "info"
        | "warn"
        | "error",
    },
  },
};

// AWS Amplify Configuration (v6 format)
export const amplifyConfig = {
  Auth: {
    Cognito: {
      region: awsConfig.cognito.region,
      userPoolId: awsConfig.cognito.userPoolId,
      userPoolClientId: awsConfig.cognito.userPoolWebClientId,
      loginWith: {
        email: true,
      },
    },
  },
};

// Environment-specific overrides
if (awsConfig.app.environment === "production") {
  // Production-specific configurations can be added here
  console.log("Running in production mode");
}

export default awsConfig;
