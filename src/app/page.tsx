"use client";

import React from 'react';
import { AppHeader } from '@/components/header';
import { TaskGenerator } from '@/components/task/generator';
import { TaskList } from '@/components/task/list';
import { CompletedTaskList } from '@/components/task/completed-list';
import { useTasks } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const {
    tasks,
    setTasks,
    updateTask,
    deleteTask,
    reorderTasks,
    adjustCategories,
    renameCategory,
    isInitialized,
    completedTasks,
  } = useTasks();

  const groupedTasks = React.useMemo(() => {
    return tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);
  }, [tasks]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader tasks={tasks} adjustCategories={adjustCategories} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <TaskGenerator setTasks={setTasks} />

          <div className="mt-12">
            {!isInitialized ? (
              <div className="space-y-8">
                <Skeleton className="h-8 w-1/4" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-8 w-1/3 mt-8" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : (
              <>
                <TaskList
                  groupedTasks={groupedTasks}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  reorderTasks={reorderTasks}
                  renameCategory={renameCategory}
                />
                {completedTasks.length > 0 && (
                  <div className="mt-12">
                    <Separator className="my-8" />
                    <CompletedTaskList tasks={completedTasks} updateTask={updateTask} deleteTask={deleteTask} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
