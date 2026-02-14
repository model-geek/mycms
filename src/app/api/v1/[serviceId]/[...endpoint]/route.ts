import { NextRequest, NextResponse } from "next/server";

import {
  handleListContents,
  handleGetContent,
  handleCreateContent,
  handleUpdateContent,
  handleDeleteContent,
} from "@/features/content-hub/content-api/handler";
import { parseContentApiQuery } from "@/features/content-hub/content-api/query-parser";

type RouteContext = { params: Promise<{ serviceId: string; endpoint: string[] }> };

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { serviceId, endpoint } = await params;
    const endpointSlug = endpoint[0];
    const contentId = endpoint[1];
    const query = parseContentApiQuery(request.nextUrl.searchParams);

    if (contentId) {
      return handleGetContent(serviceId, endpointSlug, contentId, query);
    }

    return handleListContents(serviceId, endpointSlug, query);
  } catch (error) {
    const message = error instanceof Error ? error.message : "内部エラーが発生しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { serviceId, endpoint } = await params;
    const endpointSlug = endpoint[0];
    const body = await request.json();

    return handleCreateContent(serviceId, endpointSlug, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "内部エラーが発生しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { serviceId, endpoint } = await params;
    const endpointSlug = endpoint[0];
    const contentId = endpoint[1];

    if (!contentId) {
      return NextResponse.json({ message: "コンテンツIDが必要です" }, { status: 400 });
    }

    const body = await request.json();
    return handleUpdateContent(serviceId, endpointSlug, contentId, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "内部エラーが発生しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { serviceId, endpoint } = await params;
    const endpointSlug = endpoint[0];
    const contentId = endpoint[1];

    if (!contentId) {
      return NextResponse.json({ message: "コンテンツIDが必要です" }, { status: 400 });
    }

    const body = await request.json();
    return handleUpdateContent(serviceId, endpointSlug, contentId, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "内部エラーが発生しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { serviceId, endpoint } = await params;
    const endpointSlug = endpoint[0];
    const contentId = endpoint[1];

    if (!contentId) {
      return NextResponse.json({ message: "コンテンツIDが必要です" }, { status: 400 });
    }

    return handleDeleteContent(serviceId, endpointSlug, contentId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "内部エラーが発生しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}
