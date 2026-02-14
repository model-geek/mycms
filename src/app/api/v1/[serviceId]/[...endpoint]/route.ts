import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; endpoint: string[] }> },
) {
  const { serviceId, endpoint } = await params;
  const endpointSlug = endpoint[0];
  const contentId = endpoint[1]; // optional

  // TODO: Implement in Phase 2
  return NextResponse.json(
    {
      message: "Content API - Coming soon",
      serviceId,
      endpointSlug,
      contentId,
    },
    { status: 501 },
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; endpoint: string[] }> },
) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; endpoint: string[] }> },
) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; endpoint: string[] }> },
) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; endpoint: string[] }> },
) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
