import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // 1. Define Protected Routes
  const protectedPages = ["/profile", "/favorites", "/history", "/settings"]
  const protectedApis = ["/api/favorites", "/api/travel/records"]

  // 2. Check Authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isProtectedPage = protectedPages.some(route => pathname.startsWith(route))
  const isProtectedApi = protectedApis.some(route => pathname.startsWith(route))

  // 3. Handle Unauthorized Access
  if (!token) {
    // Page Redirect
    if (isProtectedPage) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // API Error
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // 4. Proceed (Headers are now handled by next.config.js)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/favorites/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/api/favorites/:path*",
    "/api/travel/records/:path*",
    // Removed dashboard from matcher unless you explicitly want to protect it
  ],
}