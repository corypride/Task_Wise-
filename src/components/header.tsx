"use client";

import type { Task } from '@/lib/types';
import { Logo } from '@/components/logo';
import { AdjustCategoriesDialog } from '@/components/task/adjust-categories-dialog';
import { ExportDialog } from '@/components/task/export-dialog';

interface AppHeaderProps {
  tasks: Task[];
  adjustCategories: (instructions: string) => Promise<void>;
}

export function AppHeader({ tasks, adjustCategories }: AppHeaderProps) {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-xl font-bold text-primary tracking-tight">
            TaskWise AI
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AdjustCategoriesDialog
            tasks={tasks}
            onAdjust={adjustCategories}
          />
          <ExportDialog tasks={tasks} />
        </div>
      </div>
    </header>
  );
}
