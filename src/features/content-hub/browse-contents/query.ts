import { db } from "@/db";
import { contents } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT } from "../constants";
import type { Content } from "../model";

import type { ListContentsParams, ListContentsResult } from "./model";

export async function listContents(
  params: ListContentsParams,
): Promise<ListContentsResult> {
  const limit = Math.min(params.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  const offset = params.offset ?? 0;

  const conditions = [
    eq(contents.apiSchemaId, params.apiSchemaId),
    eq(contents.serviceId, params.serviceId),
  ];

  if (params.status) {
    conditions.push(eq(contents.status, params.status));
  }

  const where = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(contents)
    .where(where);

  const rows = await db
    .select()
    .from(contents)
    .where(where)
    .orderBy(desc(contents.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    contents: rows as Content[],
    totalCount: totalResult?.count ?? 0,
    limit,
    offset,
  };
}
