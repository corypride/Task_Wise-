"use client";

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import { TaskCard } from './card';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { getIconForCategory } from './icons';

interface TaskListProps {
  groupedTasks: Record<string, Task[]>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (draggedTaskId: string, targetTaskId: string | null, targetCategory: string) => void;
}

export function TaskList({ groupedTasks, updateTask, deleteTask, reorderTasks }: TaskListProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ category: string; taskId: string | null } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedItemId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, category: string, taskId: string | null) => {
    e.preventDefault();
    if (taskId === draggedItemId) return;
    setDropTarget({ category, taskId });
  };

  const handleDrop = (e: React.DragEvent, category: string, taskId: string | null) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
      reorderTasks(draggedId, taskId, category);
    }
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDropTarget(null);
  };

  const categories = Object.keys(groupedTasks);

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-muted-foreground">Your task list is empty</h2>
        <p className="text-muted-foreground mt-2">Describe your project above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.sort().map(category => {
        const CategoryIcon = getIconForCategory(category);
        return (
          <div
            key={category}
            onDragOver={(e) => handleDragOver(e, category, null)}
            onDrop={(e) => handleDrop(e, category, null)}
            onDragLeave={() => setDropTarget(null)}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CategoryIcon className="h-5 w-5 text-accent" />
              {category}
            </h2>
            <div className="space-y-3">
              {groupedTasks[category].map(task => (
                <div
                  key={task.id}
                  onDragOver={(e) => handleDragOver(e, category, task.id)}
                  onDrop={(e) => handleDrop(e, category, task.id)}
                >
                  <TaskCard
                    task={task}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                    onDragStart={handleDragStart}
                  />
                  <div
                    className={cn(
                      'h-2 rounded-md transition-all duration-150',
                      dropTarget?.category === category && dropTarget.taskId === task.id
                        ? 'bg-primary/20 mt-2'
                        : 'bg-transparent'
                    )}
                  />
                </div>
              ))}
              <div
                className={cn(
                  'h-2 rounded-md transition-all duration-150',
                  dropTarget?.category === category && dropTarget.taskId === null
                    ? 'bg-primary/20 mt-2'
                    : 'bg-transparent'
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
