import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  // Extract the IP address from the request
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  
  // Apply rate limiting
  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

  // Return response with rate limit headers
  const res = success
    ? NextResponse.next()
    : new NextResponse("Too Many Requests", { status: 429 });

  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());

  return res;
}

// Only apply rate limiting to specific paths to avoid limiting static assets
export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",
    // Protect auth and heavy mutations
    "/auth/:path*",
  ],
};
