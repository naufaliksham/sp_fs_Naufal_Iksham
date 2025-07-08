import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { user: currentUser } = await getAuthenticatedSession();
  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  try {
    const whereCondition: Prisma.UserWhereInput = { id: { not: currentUser.id } };

    if (typeof query === "string" && query.length > 0) {
      whereCondition.email = {
        contains: query,
        mode: 'insensitive',
      };
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: { id: true, email: true },
      take: 10,
    });

    const members = await prisma.membership.findMany({
      where: { projectId },
      select: { userId: true },
    });
    const memberIds = new Set(members.map(m => m.userId));

    const results = users.map(user => ({
      ...user,
      isMember: memberIds.has(user.id),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("USER_SEARCH_ERROR", error);
    return NextResponse.json({ message: "Gagal mencari pengguna" }, { status: 500 });
  }
}