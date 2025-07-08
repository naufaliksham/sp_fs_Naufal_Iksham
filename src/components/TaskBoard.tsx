"use client";

import { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@prisma/client";
import TaskCard from "./TaskCard";
import PusherClient from "pusher-js";

type FullTask = Task & { assignee: { email: string; } | null };
type TaskColumns = { [key in TaskStatus]: FullTask[] };
interface TaskBoardProps { initialTasks: FullTask[] }

export default function TaskBoard({ initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState<FullTask[]>(initialTasks);

  const columns: TaskColumns = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => (new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1));
    return {
      todo: sortedTasks.filter((task) => task.status === TaskStatus.todo),
      inProgress: sortedTasks.filter((task) => task.status === TaskStatus.inProgress),
      done: sortedTasks.filter((task) => task.status === TaskStatus.done),
    };
  }, [tasks]);

  useEffect(() => {
    const projectId = initialTasks[0]?.projectId;
    if (!projectId) return;

    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = `project-${projectId}`;
    const channel = pusher.subscribe(channelName);
    console.log(`[PUSHER] Berlangganan ke channel: ${channelName}`);

    channel.bind("task:update", (updatedTask: FullTask) => {
      console.log("[PUSHER] Menerima event 'task:update'", updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
      );
    });

    return () => {
      console.log(`[PUSHER] Berhenti langganan dari channel: ${channelName}`);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [initialTasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newStatus = destination.droppableId as TaskStatus;
    const originalTasks = [...tasks];

    setTasks(prev => prev.map(t =>
      t.id === draggableId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));

    const res = await fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      setTasks(originalTasks);
    }
  };

  const columnNames: { [key in TaskStatus]: string } = {
    todo: "To Do", inProgress: "In Progress", done: "Done",
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(columns) as TaskStatus[]).map((status) => (
          <div key={status} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">{columnNames[status]}</h2>
            <Droppable droppableId={status}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[500px]">
                  {columns[status].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}