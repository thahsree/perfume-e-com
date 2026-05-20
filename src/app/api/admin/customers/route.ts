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

export async function GET(request: Request) {
  try {
    const user = getSessionUser();
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const details = await UserRepository.getCustomerDetail(id);
      if (!details) {
        return NextResponse.json({ error: "Customer not found." }, { status: 404 });
      }
      return NextResponse.json(details);
    }

    const customers = await UserRepository.getAllCustomers();
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers list." },
      { status: 500 }
    );
  }
}
