import { getAuthenticatedSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InviteMemberForm from "@/components/InviteMemberForm";
import DeleteProjectDialog from "@/components/DeleteProjectDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import Link from "next/link";

async function getProjectSettingsData(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      memberships: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
  return project;
}

const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

export default async function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const { user: sessionUser } = await getAuthenticatedSession();
  if (!sessionUser) redirect('/login');

  const project = await getProjectSettingsData(params.id, sessionUser.id);
  if (!project) redirect('/dashboard');

  const isOwner = project.ownerId === sessionUser.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Anggota Proyek</CardTitle>
            <CardDescription>Daftar pengguna yang memiliki akses ke proyek ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.memberships.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(member.user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.email}</p>
                      {project.ownerId === member.user.id && <p className="text-xs text-gray-500">Pemilik</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ekspor Data Proyek</CardTitle>
            <CardDescription>
              Unduh salinan semua data proyek ini, termasuk tugas dan daftar anggota, dalam format JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/api/projects/${project.id}/export`} download>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Ekspor ke JSON
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Tambah Anggota Baru</CardTitle>
              <CardDescription>Tambahkan anggota baru menggunakan email mereka yang terdaftar.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteMemberForm projectId={project.id} />
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
              <CardDescription>Tindakan di bawah ini tidak dapat dibatalkan.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="font-medium">Hapus proyek ini secara permanen.</p>
              <DeleteProjectDialog projectId={project.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}