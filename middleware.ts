import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Rotas que requerem autenticação
  const protectedRoutes = ["/dashboard", "/categories", "/goals", "/settings"];

  // Rotas de autenticação (não acessíveis se já logado)
  const authRoutes = ["/login", "/register"];

  // Verificar se está tentando acessar rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Verificar se está em rota de auth
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se está em rota protegida e não está autenticado, redirecionar para login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar login/register, redirecionar para dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
