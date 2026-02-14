import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/infrastructure/auth/auth-server";

const handler = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  try {
    return await handler.GET(req);
  } catch (e) {
    console.error("[auth GET]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    return await handler.POST(req);
  } catch (e) {
    console.error("[auth POST]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
