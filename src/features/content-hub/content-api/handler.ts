import { db } from "@/db";
import { apiSchemas, contents } from "@/db/schema";
import { eq, and, desc, asc, count, sql, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import type { Content } from "../model";

import type { ContentApiQuery, ContentListApiResponse } from "./model";
import { serializeContent, serializeContentWithDraft } from "./serializer";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function resolveSchema(serviceId: string, endpointSlug: string) {
  const [schema] = await db
    .select()
    .from(apiSchemas)
    .where(
      and(
        eq(apiSchemas.serviceId, serviceId),
        eq(apiSchemas.endpoint, endpointSlug),
      ),
    );
  return schema ?? null;
}

function buildOrderBy(orders: string | undefined) {
  if (!orders) return [desc(contents.createdAt)];

  return orders.split(",").map((order) => {
    const trimmed = order.trim();
    if (trimmed.startsWith("-")) {
      const field = trimmed.slice(1);
      if (field === "createdAt") return desc(contents.createdAt);
      if (field === "updatedAt") return desc(contents.updatedAt);
      if (field === "publishedAt") return desc(contents.publishedAt);
      return desc(contents.createdAt);
    }
    if (trimmed === "createdAt") return asc(contents.createdAt);
    if (trimmed === "updatedAt") return asc(contents.updatedAt);
    if (trimmed === "publishedAt") return asc(contents.publishedAt);
    return desc(contents.createdAt);
  });
}

export async function handleListContents(
  serviceId: string,
  endpointSlug: string,
  query: ContentApiQuery,
): Promise<NextResponse<ContentListApiResponse | { message: string }>> {
  const schema = await resolveSchema(serviceId, endpointSlug);
  if (!schema) {
    return errorResponse("APIが見つかりません", 404);
  }

  if (schema.type !== "list") {
    return errorResponse("このAPIはリスト型ではありません", 400);
  }

  const conditions = [
    eq(contents.apiSchemaId, schema.id),
    eq(contents.serviceId, serviceId),
    eq(contents.status, "published"),
  ];

  if (query.ids && query.ids.length > 0) {
    conditions.push(inArray(contents.id, query.ids));
  }

  if (query.q) {
    conditions.push(sql`${contents.data}::text ILIKE ${"%" + query.q + "%"}`);
  }

  const where = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(contents)
    .where(where);

  const orderBy = buildOrderBy(query.orders);

  const rows = await db
    .select()
    .from(contents)
    .where(where)
    .orderBy(...orderBy)
    .limit(query.limit)
    .offset(query.offset);

  const serialized = (rows as Content[]).map((c) =>
    serializeContent(c, query.fields),
  );

  return NextResponse.json({
    contents: serialized,
    totalCount: totalResult?.count ?? 0,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function handleGetContent(
  serviceId: string,
  endpointSlug: string,
  contentId: string,
  query: ContentApiQuery,
): Promise<NextResponse> {
  const schema = await resolveSchema(serviceId, endpointSlug);
  if (!schema) {
    return errorResponse("APIが見つかりません", 404);
  }

  if (schema.type === "object") {
    const [content] = await db
      .select()
      .from(contents)
      .where(
        and(
          eq(contents.apiSchemaId, schema.id),
          eq(contents.serviceId, serviceId),
        ),
      )
      .limit(1);

    if (!content) {
      return errorResponse("コンテンツが見つかりません", 404);
    }

    const c = content as Content;
    const serialized = query.draftKey
      ? serializeContentWithDraft(c, query.fields)
      : serializeContent(c, query.fields);

    return NextResponse.json(serialized);
  }

  const conditions = [
    eq(contents.id, contentId),
    eq(contents.apiSchemaId, schema.id),
    eq(contents.serviceId, serviceId),
  ];

  if (!query.draftKey) {
    conditions.push(eq(contents.status, "published"));
  }

  const [content] = await db
    .select()
    .from(contents)
    .where(and(...conditions));

  if (!content) {
    return errorResponse("コンテンツが見つかりません", 404);
  }

  const c = content as Content;
  const serialized = query.draftKey
    ? serializeContentWithDraft(c, query.fields)
    : serializeContent(c, query.fields);

  return NextResponse.json(serialized);
}

export async function handleCreateContent(
  serviceId: string,
  endpointSlug: string,
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const schema = await resolveSchema(serviceId, endpointSlug);
  if (!schema) {
    return errorResponse("APIが見つかりません", 404);
  }

  const status = (body.status as string) ?? "draft";
  const isPublished = status === "published";
  const now = new Date();

  const data = { ...body };
  delete data.status;

  const [content] = await db
    .insert(contents)
    .values({
      apiSchemaId: schema.id,
      serviceId,
      data: isPublished ? data : null,
      draftData: isPublished ? null : data,
      status,
      publishedAt: isPublished ? now : null,
    })
    .returning();

  return NextResponse.json(
    serializeContent(content as Content),
    { status: 201 },
  );
}

export async function handleUpdateContent(
  serviceId: string,
  endpointSlug: string,
  contentId: string,
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const schema = await resolveSchema(serviceId, endpointSlug);
  if (!schema) {
    return errorResponse("APIが見つかりません", 404);
  }

  const [existing] = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.id, contentId),
        eq(contents.apiSchemaId, schema.id),
        eq(contents.serviceId, serviceId),
      ),
    );

  if (!existing) {
    return errorResponse("コンテンツが見つかりません", 404);
  }

  const now = new Date();
  const c = existing as Content;
  const status = (body.status as string) ?? c.status;
  const isPublishing = status === "published";

  const data = { ...body };
  delete data.status;

  const updateValues: Record<string, unknown> = { updatedAt: now };

  if (isPublishing) {
    updateValues.data = data;
    updateValues.draftData = null;
    updateValues.status = "published";
    updateValues.publishedAt = c.publishedAt ?? now;
    updateValues.revisedAt = c.publishedAt ? now : null;
  } else {
    updateValues.draftData = data;
    updateValues.status = status;
  }

  const [content] = await db
    .update(contents)
    .set(updateValues)
    .where(eq(contents.id, contentId))
    .returning();

  return NextResponse.json(serializeContent(content as Content));
}

export async function handleDeleteContent(
  serviceId: string,
  endpointSlug: string,
  contentId: string,
): Promise<NextResponse> {
  const schema = await resolveSchema(serviceId, endpointSlug);
  if (!schema) {
    return errorResponse("APIが見つかりません", 404);
  }

  const [content] = await db
    .delete(contents)
    .where(
      and(
        eq(contents.id, contentId),
        eq(contents.apiSchemaId, schema.id),
        eq(contents.serviceId, serviceId),
      ),
    )
    .returning();

  if (!content) {
    return errorResponse("コンテンツが見つかりません", 404);
  }

  return new NextResponse(null, { status: 204 });
}
