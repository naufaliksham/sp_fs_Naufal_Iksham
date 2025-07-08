import { getAuthenticatedSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TaskBoard from "@/components/TaskBoard";
import TaskAnalyticsChart from "@/components/TaskAnalyticsChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

async function getTasksForProject(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return tasks;
}

export default async function ProjectBoardPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await getAuthenticatedSession();
  if (!user) {
    redirect("/login");
  }

  const tasks = await getTasksForProject(params.id);

  return (
    <div className="space-y-8">
      <TaskAnalyticsChart tasks={tasks} />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Tips Penggunaan</AlertTitle>
        <AlertDescription>
          Klik sebuah kartu untuk melihat detail. Untuk memindahkan, geser kartu ke kolom lain atau gunakan menu (∙∙∙).
        </AlertDescription>
      </Alert>

      <TaskBoard initialTasks={tasks} />
    </div>
  );
}