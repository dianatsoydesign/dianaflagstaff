import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config :  no R2 incremental cache required for first deploy.
export default defineCloudflareConfig({});
