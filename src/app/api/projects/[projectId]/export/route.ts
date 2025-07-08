import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  const { projectId } = params;

  try {
    const membership = await prisma.membership.findFirst({
      where: { projectId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, email: true }
        },
        memberships: {
          include: {
            user: {
              select: { id: true, email: true }
            }
          }
        },
        tasks: true,
      },
    });

    if (!projectData) {
      return NextResponse.json({ message: "Proyek tidak ditemukan" }, { status: 404 });
    }

    const jsonString = JSON.stringify(projectData, null, 2);
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="project-${projectId}-export.json"`);

    return new NextResponse(jsonString, { headers });

  } catch (error) {
    console.error(`EXPORT_PROJECT_${projectId}_ERROR`, error);
    return NextResponse.json({ message: "Gagal mengekspor data" }, { status: 500 });
  }
}