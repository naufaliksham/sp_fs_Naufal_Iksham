import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  const { projectId } = params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ message: "Proyek tidak ditemukan" }, { status: 404 });
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ message: "Forbidden: Anda bukan pemilik proyek" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: "Proyek berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE_PROJECT_${projectId}_ERROR`, error);
    return NextResponse.json({ message: "Gagal menghapus proyek" }, { status: 500 });
  }
}