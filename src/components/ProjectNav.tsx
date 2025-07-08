"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";

interface ProjectNavProps {
  projectId: string;
}

export default function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();
  const activeTab = pathname.includes("/settings") ? "settings" : "board";
  const isBoardPage = activeTab === "board";

  return (
    <div className="flex justify-between items-center mb-6">
      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <Link href={`/projects/${projectId}`}>
            <TabsTrigger value="board">Papan Tugas</TabsTrigger>
          </Link>
          <Link href={`/projects/${projectId}/settings`}>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        <Link href="/dashboard">
          <Button variant="outline">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        {isBoardPage && <AddTaskDialog projectId={projectId} />}
      </div>
    </div>
  );
}