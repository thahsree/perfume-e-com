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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await OrderRepository.getById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const user = getSessionUser();
    // Allow if user is admin, OR user owns the order, OR guest email matches order email
    const isOwner = user && order.userId === user.id;
    const isAdmin = user && user.role === "ADMIN";
    
    // For guest checking out, we allow viewing if they passed an email match in request header or param,
    // otherwise we restrict it. Let's make it simple: allow if user matches or admin.
    if (!isAdmin && !isOwner) {
      // Check query parameter for guest checkout verification
      const { searchParams } = new URL(request.url);
      const emailQuery = searchParams.get("email");
      if (emailQuery?.toLowerCase() !== order.email.toLowerCase()) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    const updated = await OrderRepository.updateStatus(params.id, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
