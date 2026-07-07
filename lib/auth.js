import { cookies } from "next/headers";

const TOKEN = "betlens_admin_ok";

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return password === expected;
}

export function isAdmin() {
  return cookies().get("bl_admin")?.value === TOKEN;
}

export function adminCookie() {
  return { name: "bl_admin", value: TOKEN, httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 };
}
