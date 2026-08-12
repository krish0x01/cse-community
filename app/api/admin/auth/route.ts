import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  safeComparePasscode,
  sanitizeString,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 5 attempts per 15 minutes (900,000 ms) per IP to prevent brute-forcing
    const limit = checkRateLimit(`admin_auth_${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const body = await request.json();
    const passcode = sanitizeString(body?.passcode || "");

    const expectedPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      "CSE-2026";

    if (!passcode || !safeComparePasscode(passcode, expectedPasscode)) {
      return NextResponse.json(
        { error: "Incorrect access code. Access denied." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Moderator session authenticated successfully.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
