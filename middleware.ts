import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";

const privateRoutes = ["/dashboard", "/goals", "/categories", "/settings"];

export default auth((request) => {
  const { nextUrl } = request;
  const isAuthenticated = Boolean(request.auth);
  const isPrivateRoute = privateRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isLoginRoute = nextUrl.pathname === "/login";

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
