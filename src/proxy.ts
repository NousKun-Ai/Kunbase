import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rate-limit";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const isRateLimitedPath = request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth');

  if (isRateLimitedPath) {
    // Extract the IP address from the request
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    // Apply rate limiting
    const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      const res = new NextResponse("Too Many Requests", { status: 429 });
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }

    // Run auth checks and apply rate limit headers to the response
    const res = await updateSession(request);
    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  }

  // For all other routes, just run the auth checks
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
