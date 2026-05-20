export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRepository } from "@/core/repositories/user.repository";

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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const wishlist = await UserRepository.getWishlist(user.id);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch wishlist." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { productId, action } = await request.json();

    if (!productId || !action) {
      return NextResponse.json(
        { error: "Product ID and action ('add' or 'remove') are required." },
        { status: 400 }
      );
    }

    if (action === "add") {
      await UserRepository.addToWishlist(user.id, productId);
    } else if (action === "remove") {
      await UserRepository.removeFromWishlist(user.id, productId);
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update wishlist." },
      { status: 500 }
    );
  }
}
