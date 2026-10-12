import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Stricter rate limiter for auth / heavy mutations (5 reqs / 1 min)
export const strictRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-strict",
});

// Rate limiter for publishing skills (5 publishes per 10 minutes)
export const publishRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-publish",
});

// Rate limiter for reporting skills (5 reports per 5 minutes)
export const reportRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-report",
});

