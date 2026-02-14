import { z } from "zod/v4";

export const createContentSchema = z.object({
  apiSchemaId: z.string().uuid("スキーマIDが不正です"),
  serviceId: z.string().uuid("サービスIDが不正です"),
  data: z.record(z.string(), z.unknown()),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateContentSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
