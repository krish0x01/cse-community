import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    const expectedPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      "CSE-2026";

    if (!passcode || passcode.trim() !== expectedPasscode.trim()) {
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
