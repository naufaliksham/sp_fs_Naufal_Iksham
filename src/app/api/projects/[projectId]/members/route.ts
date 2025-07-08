// src/app/api/projects/[projectId]/members/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { user: currentUser, response } = await getAuthenticatedSession();
  if (!currentUser) return response;

  const { projectId } = params;

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "Email diperlukan" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project?.ownerId !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden: Hanya pemilik yang bisa mengundang" }, { status: 403 });
    }

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
      return NextResponse.json({ message: "User dengan email tersebut tidak ditemukan" }, { status: 404 });
    }

    const existingMembership = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: userToInvite.id, projectId } },
    });
    if (existingMembership) {
      return NextResponse.json({ message: "User ini sudah menjadi anggota proyek" }, { status: 409 });
    }

    const newMembership = await prisma.membership.create({
      data: {
        userId: userToInvite.id,
        projectId: projectId,
      },
    });

    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    console.error(`INVITE_MEMBER_ERROR`, error);
    return NextResponse.json({ message: "Gagal mengundang anggota" }, { status: 500 });
  }
}