"use client";

import React, { useState } from 'react';
import { generateTaskList } from '@/ai/flows/generate-task-list';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';


interface TaskGeneratorProps {
  setTasks: (tasks: Task[]) => void;
}

export function TaskGenerator({ setTasks }: TaskGeneratorProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description is empty',
        description: 'Please describe your project or goal.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTaskList({ description });
      const newTasks: Task[] = result.taskList.map(task => ({
        id: uuidv4(),
        ...task,
        title: task.task,
        completed: false,
      }));
      setTasks(newTasks);
      toast({
        title: 'Task list generated!',
        description: `Created ${newTasks.length} tasks for you.`,
      });
    } catch (error) {
      console.error('Failed to generate task list:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Generate Your Task List
        </CardTitle>
        <CardDescription>
          Describe your project or goal, and let AI create a structured task list for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <Textarea
            placeholder="e.g., Launch a new marketing campaign for our new e-book."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Tasks'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
