import { NextResponse } from "next/server";
import { getMakerPassword, MAKER_COOKIE, signMakerToken } from "@/lib/maker-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;
  const password = body?.password ?? "";
  if (password !== getMakerPassword()) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MAKER_COOKIE, signMakerToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MAKER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
