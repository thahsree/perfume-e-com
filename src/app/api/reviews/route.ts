import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReviewRepository } from "@/core/repositories/review.repository";

function getSessionUser() {
  const session = cookies().get("niche_session");
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const getPending = searchParams.get("pending") === "true";

    if (getPending) {
      const user = getSessionUser();
      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
      const pending = await ReviewRepository.getPending();
      return NextResponse.json(pending);
    }

    if (!productId) {
      return NextResponse.json(
        { error: "ProductId is required." },
        { status: 400 }
      );
    }

    const reviews = await ReviewRepository.getByProductId(productId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    const body = await request.json();
    const { productId, rating, comment, userName } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating, and comment are required." },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const review = await ReviewRepository.create({
      productId,
      userId: user?.id || null,
      userName: userName || user?.name || "Anonymous Reviewer",
      rating: ratingNum,
      comment,
      verifiedPurchase: !!user, // Set verified purchase flag if logged in
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
    }

    const approvedReview = await ReviewRepository.approve(id);
    return NextResponse.json(approvedReview);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve review." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
    }

    await ReviewRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete review." },
      { status: 500 }
    );
  }
}
