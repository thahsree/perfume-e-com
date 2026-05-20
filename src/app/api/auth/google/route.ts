export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRepository } from "@/core/repositories/user.repository";

export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Google email and name are required." },
        { status: 400 }
      );
    }

    let user = await UserRepository.getByEmail(email);

    if (!user) {
      // Auto-register new social login users
      const randomHash = Math.random().toString(36).slice(-8);
      user = await UserRepository.create({
        email,
        name,
        passwordHash: randomHash, // Dummy password hash
      });
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: image || null,
    };

    cookies().set("niche_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ user: sessionData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "OAuth simulation failed." },
      { status: 500 }
    );
  }
}
