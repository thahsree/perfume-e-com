import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const sessionCookie = cookies().get("niche_session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
