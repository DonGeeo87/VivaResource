/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window algorithm based on client IP.
 *
 * NOTE: This is a basic protection for single-server deployments.
 * For production with multiple servers, use Redis or an external service.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  max: number;
  /** Window size in milliseconds (default: 15 minutes) */
  windowMs: number;
}

// Default configurations for different endpoints
export const RATE_LIMITS = {
  newsletter: { max: 5, windowMs: 15 * 60 * 1000 } as RateLimitConfig,    // 5 per 15min
  upload: { max: 10, windowMs: 15 * 60 * 1000 } as RateLimitConfig,       // 10 per 15min
  email: { max: 10, windowMs: 15 * 60 * 1000 } as RateLimitConfig,        // 10 per 15min
  contact: { max: 5, windowMs: 15 * 60 * 1000 } as RateLimitConfig,       // 5 per 15min
  ai: { max: 3, windowMs: 15 * 60 * 1000 } as RateLimitConfig,            // 3 per 15min
  default: { max: 20, windowMs: 15 * 60 * 1000 } as RateLimitConfig,      // 20 per 15min
};

/**
 * Check if a request should be rate limited.
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns Object with `limited` boolean and `retryAfter` milliseconds if limited
 */
export function checkRateLimit(ip: string, config: RateLimitConfig): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    rateLimitStore.forEach((val, key) => {
      if (val.resetAt < now) {
        rateLimitStore.delete(key);
      }
    });
  }

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { limited: false, retryAfter: 0 };
  }

  if (entry.count >= config.max) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { limited: false, retryAfter: 0 };
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP (original client)
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
