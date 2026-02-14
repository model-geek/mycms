import { db } from "@/db";
import { media } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

import type { Media, ListMediaParams, ListMediaResult } from "../model";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function listMedia(
  params: ListMediaParams,
): Promise<ListMediaResult> {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = params.offset ?? 0;

  const where = eq(media.serviceId, params.serviceId);

  const [totalResult] = await db
    .select({ count: count() })
    .from(media)
    .where(where);

  const rows = await db
    .select()
    .from(media)
    .where(where)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    media: rows as Media[],
    totalCount: totalResult?.count ?? 0,
    limit,
    offset,
  };
}
