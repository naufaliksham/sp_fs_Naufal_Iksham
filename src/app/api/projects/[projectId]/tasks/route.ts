import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  const { projectId } = params;
  
  try {
    const membership = await prisma.membership.findFirst({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, status, assigneeId } = await request.json();

    if (!title) {
      return NextResponse.json({ message: "Judul task diperlukan" }, { status: 400 });
    }

    if (assigneeId) {
      const assigneeMembership = await prisma.membership.findFirst({
        where: { projectId, userId: assigneeId },
      });
      if (!assigneeMembership) {
        return NextResponse.json({ message: "Assignee bukan member dari proyek ini" }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId,
        assigneeId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(`CREATE_TASK_IN_PROJECT_${projectId}_ERROR`, error);
    return NextResponse.json({ message: "Gagal membuat task" }, { status: 500 });
  }
}