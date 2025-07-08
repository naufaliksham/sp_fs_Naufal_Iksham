import { getAuthenticatedSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProjectNav from "@/components/ProjectNav";

async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      memberships: { some: { userId } },
    },
  });
  return project;
}


export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { user } = await getAuthenticatedSession();
  if (!user) redirect("/login");

  const project = await getProject(params.id, user.id);
  if (!project) redirect("/dashboard");

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <div>
          <p className="text-sm text-gray-500">Proyek</p>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
      </div>

      <ProjectNav projectId={project.id} />

      <main>{children}</main>
    </div>
  );
}