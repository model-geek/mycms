/** Webhook */
export interface Webhook {
  id: string;
  serviceId: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Webhook イベント種別 */
export const WEBHOOK_EVENTS = [
  "content.created",
  "content.updated",
  "content.published",
  "content.unpublished",
  "content.deleted",
  "media.created",
  "media.deleted",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
