import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/session";

export async function GET() {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  try {
    const projects = await prisma.project.findMany({
      where: {
        memberships: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, email: true }
        }
      }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET_PROJECTS_ERROR", error);
    return NextResponse.json({ message: "Gagal mengambil data proyek" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, response } = await getAuthenticatedSession();
  if (!user) return response;

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: "Nama proyek diperlukan" }, { status: 400 });
    }

    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          ownerId: user.id,
        },
      });

      await tx.membership.create({
        data: {
          projectId: project.id,
          userId: user.id,
        },
      });

      return project;
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR", error);
    return NextResponse.json({ message: "Gagal membuat proyek" }, { status: 500 });
  }
}