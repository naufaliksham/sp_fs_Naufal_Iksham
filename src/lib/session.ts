import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { user: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  return { user: session.user, response: null };
}