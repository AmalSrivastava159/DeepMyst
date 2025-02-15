import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const url = request.nextUrl;
  
    // ✅ If the user is authenticated and tries to access auth pages, redirect them to dashboard
    if (token && ["/sign-in", "/sign-up", "/verify"].includes(url.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  
    // ✅ If the user is NOT authenticated and tries to access a protected route, redirect to sign-in
    const protectedRoutes = ["/dashboard", "/profile"];
    if (!token && protectedRoutes.some((route) => url.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  
    return NextResponse.next(); // ✅ Allow request to continue
  }
  
  export const config = {
    matcher: ["/sign-in", "/sign-up", "/dashboard/:path*", "/verify/:path*", "/profile/:path*"],
  };