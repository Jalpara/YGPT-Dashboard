import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbzC82aIEW2htieo5pgw-GYSKo9oixgUNuoisnUBv9TLc55JA-SkEJWtF8T6z4tvgB7R/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        ...body,
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update approval.", detail: text },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update approval.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
