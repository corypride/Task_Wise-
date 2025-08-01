"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';
import { Download, Copy, Check } from 'lucide-react';

interface ExportDialogProps {
  tasks: Task[];
}

export function ExportDialog({ tasks }: ExportDialogProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const formattedTasks = useMemo(() => {
    if (tasks.length === 0) return 'No tasks to export.';

    const grouped = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return Object.entries(grouped)
      .map(([category, tasksInCategory]) => {
        const taskLines = tasksInCategory
          .map(task => `- [${task.completed ? 'x' : ' '}] ${task.title} (Priority: ${task.priority})`)
          .join('\n');
        return `## ${category}\n${taskLines}`;
      })
      .join('\n\n');
  }, [tasks]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedTasks).then(() => {
      setHasCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'Your task list has been copied.',
      });
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const username = "user";
    const date = new Date().toISOString().split('T')[0];
    const filename = `${username}_${date}.md`;

    const blob = new Blob([formattedTasks], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: 'Download Started',
        description: `Your task list is being downloaded as ${filename}.`,
    });
  };

  return (
    <Dialog onOpenChange={() => setHasCopied(false)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={tasks.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Task List</DialogTitle>
          <DialogDescription>
            Copy your task list in markdown format or download it as a file.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Textarea
            value={formattedTasks}
            readOnly
            rows={10}
            className="pr-12"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="absolute top-2 right-2 h-8 w-8"
            aria-label="Copy to clipboard"
          >
            {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
            <Button onClick={handleDownload} variant="secondary" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download File
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
