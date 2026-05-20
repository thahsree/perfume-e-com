export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrderRepository } from "@/core/repositories/order.repository";

function getSessionUser() {
  const session = cookies().get("niche_session");
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const stats = await OrderRepository.getAdminStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compile admin statistics." },
      { status: 500 }
    );
  }
}
