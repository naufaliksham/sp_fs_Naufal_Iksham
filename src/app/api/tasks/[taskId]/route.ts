import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusher";

async function verifyTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        memberships: {
          some: {
            userId: userId,
          },
        },
      },
    },
  });
  return !!task;
}

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  const hasAccess = await verifyTaskAccess(params.taskId, user.id);
  if (!hasAccess) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await request.json();

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: { status },
      include: { assignee: { select: { email: true } } },
    });

    try {
      const channel = `project-${updatedTask.projectId}`;
      const event = 'task:update';
      
      await pusherServer.trigger(channel, event, updatedTask);
      console.log(`[PUSHER] Event '${event}' terkirim ke channel '${channel}'`);
      
    } catch (e) {
      console.error("[PUSHER] Gagal mengirim event:", e);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`UPDATE_TASK_${params.taskId}_ERROR`, error);
    return NextResponse.json({ message: "Gagal mengupdate task" }, { status: 500 });
  }
}

export async function DELETE(

    { params }: { params: { taskId: string } }
) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  const { taskId } = params;

  const hasAccess = await verifyTaskAccess(taskId, user.id);
  if (!hasAccess) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    return NextResponse.json({ message: "Task berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE_TASK_${taskId}_ERROR`, error);
    return NextResponse.json({ message: "Gagal menghapus task" }, { status: 500 });
  }
}