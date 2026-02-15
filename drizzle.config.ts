import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  schemaFilter: [
    "public",
    "infra",
    "content_hub",
    "media",
    "api_keys",
    "webhooks",
    "members",
  ],
});
