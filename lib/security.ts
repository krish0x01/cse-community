import { NextResponse } from "next/server";

// ====================================================================
// 1. IN-MEMORY RATE LIMITER (Token Bucket / Sliding Window)
// ====================================================================
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enforces rate limiting by client IP address.
 */
export function checkRateLimit(
  ip: string,
  limit = 10,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean expired entries when store grows large
  if (rateLimitStore.size > 10000) {
    rateLimitStore.forEach((val, key) => {
      if (val.resetAt < now) rateLimitStore.delete(key);
    });
  }

  if (!record || record.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Extracts Client IP address safely from Request headers.
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Returns a standardized 429 Too Many Requests response.
 */
export function rateLimitResponse(resetInSec: number) {
  return NextResponse.json(
    {
      error: `Too many requests. Please wait ${resetInSec} seconds before trying again.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetInSec),
      },
    }
  );
}

// ====================================================================
// 2. ANTI-XSS & STRING SANITIZATION
// ====================================================================
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^\s"']*/gi, "")
    .trim();
}

// ====================================================================
// 3. ANTI-DOXXING & PRIVACY SAFEGUARDS
// ====================================================================
export function containsPrivateInformation(text: string): { containsPrivate: boolean; reason?: string } {
  // Phone numbers (10+ digits / international format)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  if (phoneRegex.test(text)) {
    return {
      containsPrivate: true,
      reason: "Phone numbers or personal contact numbers violate Rule #1 (Anti-Doxxing).",
    };
  }

  // Personal Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(text)) {
    return {
      containsPrivate: true,
      reason: "Personal email addresses violate Rule #1 (Anti-Doxxing).",
    };
  }

  // Credit card / Aadhaar / 16-digit patterns
  const sensitiveCardRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
  if (sensitiveCardRegex.test(text)) {
    return {
      containsPrivate: true,
      reason: "Sensitive personal identification numbers detected.",
    };
  }

  return { containsPrivate: false };
}

// ====================================================================
// 4. TIMING-SAFE PASSCODE COMPARISON
// ====================================================================
export function safeComparePasscode(provided: string, expected: string): boolean {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  const a = provided.trim();
  const b = expected.trim();

  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
