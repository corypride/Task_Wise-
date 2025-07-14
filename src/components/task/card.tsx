"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, GripVertical } from 'lucide-react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getIconForCategory } from './icons';

interface TaskCardProps {
  task: Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export function TaskCard({ task, updateTask, deleteTask, onDragStart }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const CategoryIcon = getIconForCategory(task.category);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleTitleChange = () => {
    if (title.trim() && title.trim() !== task.title) {
      updateTask(task.id, { title: title.trim() });
    } else {
      setTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleChange();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={cn(
        'group transition-all duration-300 ease-in-out hover:shadow-md',
        task.completed ? 'bg-muted/60' : 'bg-card'
      )}
    >
      <CardContent className="p-3 flex items-center gap-2">
        <button className="p-1 cursor-grab focus:cursor-grabbing focus:ring-2 focus:ring-ring rounded-sm">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={(checked) => updateTask(task.id, { completed: !!checked })}
          aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-grow mx-2" onClick={() => !task.completed && setIsEditing(true)}>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onKeyDown={handleKeyDown}
              className="h-8"
            />
          ) : (
            <span
              className={cn(
                'text-sm font-medium cursor-pointer',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
            <CategoryIcon className="h-4 w-4" />
        </div>

        <Badge variant={task.priority === 1 ? 'destructive' : (task.priority === 2 ? 'secondary' : 'outline')} className="hidden sm:inline-flex">
          Priority {task.priority}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
