/**
 * 全 feature + infrastructure の Drizzle テーブル定義を barrel re-export
 * @remarks 各 feature の schema/ ディレクトリから段階的に追加する
 */

// Auth (BetterAuth)
export * from "@/infrastructure/auth/auth-schema";

// Infrastructure
export * from "@/infrastructure/services/schema/services";

// Content Hub
export * from "@/features/content-hub/schema/api-schemas";
export * from "@/features/content-hub/schema/schema-fields";
export * from "@/features/content-hub/schema/contents";
export * from "@/features/content-hub/schema/content-versions";
export * from "@/features/content-hub/schema/relations";

// Media
export * from "@/features/media/schema/media";

// API Keys
export * from "@/features/api-keys/schema/api-keys";

// Webhooks
export * from "@/features/webhooks/schema/webhooks";

// Members
export * from "@/features/members/schema/members";
