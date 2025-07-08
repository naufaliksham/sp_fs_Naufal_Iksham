import { getAuthenticatedSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      memberships: {
        some: {
          userId: userId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return projects;
}

export default async function DashboardPage() {
  const { user } = await getAuthenticatedSession();
  if (!user) {
    redirect("/login");
  }

  const projects = await getProjects(user.id);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Proyek</h1>
        <div className="flex item-center gap-4">
            <Link href="/login">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4"/>
                Halaman Login
              </Button>
            </Link>
          <CreateProjectDialog />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">Anda belum memiliki proyek.</p>
          <p className="text-gray-500">Buat proyek pertama Anda untuk memulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    Dibuat pada: {new Date(project.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}