import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/core/services/auth.service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await AuthService.verifyCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Set secure session cookie
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    cookies().set("niche_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}
