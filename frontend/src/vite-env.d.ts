/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_USER_POOL_ID: string;
  readonly VITE_AWS_USER_POOL_WEB_CLIENT_ID: string;
  readonly VITE_API_GATEWAY_BASE_URL: string;
  readonly VITE_API_GATEWAY_ID: string;
  readonly VITE_SESSION_TIMEOUT_MINUTES: string;
  readonly VITE_AUTO_LOGOUT_ENABLED: string;
  readonly VITE_AUDIT_LOGGING_ENABLED: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
