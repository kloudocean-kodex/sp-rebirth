declare module "cloudflare:workers" {
  interface SPRebirthWorkerEnv {
    TURNSTILE_SECRET_KEY?: string;
    LEAD_DELIVERY_WEBHOOK_URL?: string;
    LEAD_DELIVERY_TOKEN?: string;
    SANITY_API_READ_TOKEN?: string;
  }

  export const env: SPRebirthWorkerEnv;
}
