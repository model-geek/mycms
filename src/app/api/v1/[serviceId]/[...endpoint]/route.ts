/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ serviceId: string; endpoint: string[] }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const { serviceId, endpoint } = await params;
  const endpointSlug = endpoint[0];
  const contentId = endpoint[1];

  // TODO: Implement in Phase 2
  return NextResponse.json(
    { message: "Content API - Coming soon", serviceId, endpointSlug, contentId },
    { status: 501 },
  );
}

export async function POST(_request: NextRequest, _context: RouteContext) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PUT(_request: NextRequest, _context: RouteContext) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PATCH(_request: NextRequest, _context: RouteContext) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function DELETE(_request: NextRequest, _context: RouteContext) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
