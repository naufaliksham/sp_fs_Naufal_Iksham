"use client";

import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Task, TaskStatus } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TaskAnalyticsChartProps {
  tasks: Task[];
}

export default function TaskAnalyticsChart({ tasks }: TaskAnalyticsChartProps) {
  const chartData = useMemo(() => {
    const todoCount = tasks.filter(task => task.status === TaskStatus.todo).length;
    const inProgressCount = tasks.filter(task => task.status === TaskStatus.inProgress).length;
    const doneCount = tasks.filter(task => task.status === TaskStatus.done).length;

    return {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [
        {
          label: 'Jumlah',
          data: [todoCount, inProgressCount, doneCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [tasks]);
  
  const totalTasks = tasks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle><center>Analisis Tugas</center></CardTitle>
      </CardHeader>
      <CardContent>
        {totalTasks > 0 ? (
          <div className="max-w-[300px] mx-auto">
             <Doughnut data={chartData} />
          </div>
        ) : (
          <p className="text-center text-gray-500">Belum ada tugas untuk dianalisis.</p>
        )}
      </CardContent>
    </Card>
  );
}