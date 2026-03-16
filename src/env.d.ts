/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_API_BASE: string
  readonly VITE_PAYPAL_CLIENT_ID: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}