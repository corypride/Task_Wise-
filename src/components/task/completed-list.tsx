"use client";

import React from 'react';
import type { Task } from '@/lib/types';
import { TaskCard } from './card';
import { CheckCircle2 } from 'lucide-react';

interface CompletedTaskListProps {
  tasks: Task[];
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export function CompletedTaskList({ tasks, updateTask, deleteTask }: CompletedTaskListProps) {
  
  const sortedTasks = [...tasks].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-semibold">Completed Tasks</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tasks you've completed. They will be automatically cleared after 7 days.
        </p>
        <div className="space-y-3">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              updateTask={updateTask}
              deleteTask={deleteTask}
              onDragStart={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
