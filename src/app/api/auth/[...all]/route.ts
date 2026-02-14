import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/infrastructure/auth/auth-server";

export const { GET, POST } = toNextJsHandler(auth);
