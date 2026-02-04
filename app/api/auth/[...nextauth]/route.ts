import NextAuth from "next-auth";

import { authConfig } from "@/src/lib/auth";

export const { GET, POST } = NextAuth(authConfig);
