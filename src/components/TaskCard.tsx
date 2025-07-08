// src/components/TaskCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus } from "@prisma/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';

type TaskWithAssignee = Task & {
  assignee: { email: string; } | null;
};

interface TaskCardProps {
  task: TaskWithAssignee;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "TODO":
      return "outline";
    case "IN_PROGRESS":
      return "default";
    case "DONE":
      return "secondary";
    default:
      return "outline";
  }
};

export default function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="mb-2 hover:bg-gray-50 cursor-pointer group">
          <CardHeader className="p-4 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">{task.title}</CardTitle>
              {task.assignee && (
                <p className="text-xs text-gray-500 pt-2">
                  Ditugaskan ke: {task.assignee.email}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem 
                  disabled={task.status === TaskStatus.todo || isUpdating}
                  onSelect={() => handleStatusChange(TaskStatus.todo)}
                >
                  Pindahkan ke To Do
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={task.status === TaskStatus.inProgress || isUpdating}
                  onSelect={() => handleStatusChange(TaskStatus.inProgress)}
                >
                  Pindahkan ke In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={task.status === TaskStatus.done || isUpdating}
                  onSelect={() => handleStatusChange(TaskStatus.done)}
                >
                  Pindahkan ke Done
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-2">
          <div>
            <h4 className="font-semibold mb-1">Status</h4>
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {task.status.replace("_", " ")}
            </Badge>
          </div>
          {task.assignee && (
            <div>
              <h4 className="font-semibold mb-1">Ditugaskan kepada</h4>
              <p className="text-sm text-gray-700">{task.assignee.email}</p>
            </div>
          )}
          {task.description && (
            <div>
              <h4 className="font-semibold mb-1">Deskripsi</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}