import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbzC82aIEW2htieo5pgw-GYSKo9oixgUNuoisnUBv9TLc55JA-SkEJWtF8T6z4tvgB7R/exec";

const validStages = ["regional", "head", "accounts"] as const;
type Stage = (typeof validStages)[number];

export async function POST(request: Request) {
  // 1. Verify Firebase ID token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = authHeader.slice(7);
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  // 2. Look up user role in Firestore
  let userRole: Stage | null = null;
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not registered." }, { status: 403 });
    }
    const role = userDoc.data()?.role;
    if (validStages.includes(role)) {
      userRole = role as Stage;
    }
  } catch {
    return NextResponse.json({ error: "Failed to verify user role." }, { status: 500 });
  }

  if (!userRole) {
    return NextResponse.json({ error: "Invalid user role." }, { status: 403 });
  }

  // 3. Parse and validate request body
  let body: { eventCode?: string; stage?: string; status?: string; by?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { eventCode, stage, status, by, notes } = body;

  if (!eventCode || !stage || !status) {
    return NextResponse.json(
      { error: "Missing required fields: eventCode, stage, status." },
      { status: 400 }
    );
  }

  // 4. Enforce role — user can only update their own approval stage
  if (stage !== userRole) {
    return NextResponse.json(
      { error: `Forbidden. You are '${userRole}' and cannot update the '${stage}' stage.` },
      { status: 403 }
    );
  }

  // 5. Forward to Apps Script
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        eventCode,
        stage,
        status,
        by: by ?? "",
        notes: notes ?? "",
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
