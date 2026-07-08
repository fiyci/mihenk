import { cookies } from "next/headers";

const TOKEN = "betlens_admin_ok";
const OP_TOKEN = "betlens_operator_ok";

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

// --- Operatör (B2B) girişi ---
export function checkOperatorPassword(password) {
  const expected = process.env.OPERATOR_PASSWORD || "operator123";
  return password === expected;
}

export function isOperator() {
  return cookies().get("bl_operator")?.value === OP_TOKEN;
}

export function operatorCookie() {
  return { name: "bl_operator", value: OP_TOKEN, httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 };
}

