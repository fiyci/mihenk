import { NextResponse } from "next/server";
import { checkPassword, adminCookie } from "../../../../lib/auth";

export async function POST(req) {
  const { password } = await req.json();
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Hatalı parola" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "bl_admin", value: "", path: "/", maxAge: 0 });
  return res;
}
