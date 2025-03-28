/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENV: string;
  readonly VITE_PORT: string;
  readonly VITE_OPEN_BROWSER: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_OAUTH_GOOGLE_CLIENT_ID: string;
  readonly VITE_OAUTH_GOOGLE_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
