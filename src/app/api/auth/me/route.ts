import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? { id: user.id, email: user.email, displayName: user.displayName } : null });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
