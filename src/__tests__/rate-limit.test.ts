/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Clear the rate limit store by re-importing
    vi.resetModules();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('127.0.0.1', RATE_LIMITS.newsletter);
      expect(result.limited).toBe(false);
      expect(result.retryAfter).toBe(0);
    });

    it('should allow up to max requests', () => {
      const ip = '10.0.0.1';
      const config = RATE_LIMITS.newsletter; // max: 5

      for (let i = 0; i < config.max; i++) {
        const result = checkRateLimit(ip, config);
        expect(result.limited).toBe(false);
      }
    });

    it('should block requests exceeding max', () => {
      const ip = '192.168.1.1';
      const config = RATE_LIMITS.newsletter; // max: 5

      // Use all allowed requests
      for (let i = 0; i < config.max; i++) {
        checkRateLimit(ip, config);
      }

      // Next request should be blocked
      const result = checkRateLimit(ip, config);
      expect(result.limited).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different IPs independently', () => {
      const config = RATE_LIMITS.ai; // max: 3

      // Exhaust IP1
      for (let i = 0; i < config.max; i++) {
        checkRateLimit('1.1.1.1', config);
      }

      // IP2 should still be allowed
      const result = checkRateLimit('2.2.2.2', config);
      expect(result.limited).toBe(false);
    });

    it('should return retryAfter in seconds', () => {
      const ip = '10.10.10.10';
      const config = RATE_LIMITS.upload; // max: 10

      for (let i = 0; i < config.max; i++) {
        checkRateLimit(ip, config);
      }

      const result = checkRateLimit(ip, config);
      expect(result.limited).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(900); // 15 min max
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18' },
      });
      expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('should use x-real-ip if x-forwarded-for is missing', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '10.0.0.1' },
      });
      expect(getClientIp(request)).toBe('10.0.0.1');
    });

    it('should return "unknown" if no IP headers present', () => {
      const request = new Request('http://localhost');
      expect(getClientIp(request)).toBe('unknown');
    });
  });

  describe('RATE_LIMITS config', () => {
    it('should have stricter limits for AI than newsletter', () => {
      expect(RATE_LIMITS.ai.max).toBeLessThan(RATE_LIMITS.newsletter.max);
    });

    it('should have same window for all configs', () => {
      const windowMs = RATE_LIMITS.default.windowMs;
      Object.values(RATE_LIMITS).forEach((config) => {
        expect(config.windowMs).toBe(windowMs);
      });
    });

    it('should have reasonable max values', () => {
      Object.entries(RATE_LIMITS).forEach(([_key, config]) => {
        expect(config.max).toBeGreaterThan(0);
        expect(config.max).toBeLessThan(1000);
        expect(config.windowMs).toBeGreaterThan(0);
      });
    });
  });
});
