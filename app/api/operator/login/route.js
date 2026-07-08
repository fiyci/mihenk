import { NextResponse } from "next/server";
import { checkOperatorPassword, operatorCookie } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { password } = await req.json();
  if (!checkOperatorPassword(password)) {
    return NextResponse.json({ error: "Hatalı şifre." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(operatorCookie());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "bl_operator", value: "", maxAge: 0, path: "/" });
  return res;
}
