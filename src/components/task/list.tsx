"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '@/lib/types';
import type { SortDirection } from '@/app/page';
import { TaskCard } from './card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getIconForCategory } from './icons';
import { Edit2, Check, ArrowDownUp, ArrowDown, ArrowUp } from 'lucide-react';

interface TaskListProps {
  groupedTasks: Record<string, Task[]>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (draggedTaskId: string, targetTaskId: string | null, targetCategory: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  sortDirections: Record<string, SortDirection>;
  toggleSortDirection: (category: string) => void;
}

export function TaskList({ groupedTasks, updateTask, deleteTask, reorderTasks, renameCategory, sortDirections, toggleSortDirection }: TaskListProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ category: string; taskId: string | null } | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCategory && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCategory]);

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

  const handleRenameCategory = (oldName: string) => {
    if (newCategoryName.trim() && newCategoryName.trim() !== oldName) {
      renameCategory(oldName, newCategoryName.trim());
    }
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, oldName: string) => {
    if (e.key === 'Enter') {
      handleRenameCategory(oldName);
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
      setNewCategoryName('');
    }
  };
  
  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
  }

  const getSortIcon = (category: string) => {
    const direction = sortDirections[category];
    if (direction === 'desc') return ArrowDown;
    if (direction === 'asc') return ArrowUp;
    return ArrowDownUp;
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
        const SortIcon = getSortIcon(category);
        return (
          <div
            key={category}
            onDragOver={(e) => handleDragOver(e, category, null)}
            onDrop={(e) => handleDrop(e, category, null)}
            onDragLeave={() => setDropTarget(null)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              dropTarget?.category === category && !dropTarget.taskId ? "bg-muted/50" : ""
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-4 group">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5 text-accent" />
                {editingCategory === category ? (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onBlur={() => handleRenameCategory(category)}
                      onKeyDown={(e) => handleCategoryKeyDown(e, category)}
                      className="h-8 text-lg font-semibold"
                    />
                    <Button size="icon" className="h-8 w-8" onClick={() => handleRenameCategory(category)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {category}
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEditingCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </h2>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => toggleSortDirection(category)}>
                <SortIcon className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
            <div className="space-y-1">
              {groupedTasks[category].map(task => (
                <div
                  key={task.id}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    handleDragOver(e, category, task.id)
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, category, task.id)
                  }}
                >
                  <div
                    className={cn(
                      'h-0 rounded-lg transition-all duration-150',
                      dropTarget?.category === category && dropTarget.taskId === task.id
                        ? 'h-14 bg-primary/20 border-2 border-dashed border-primary my-1'
                        : ''
                    )}
                  />
                  <div style={{ opacity: draggedItemId === task.id ? 0.5 : 1 }}>
                    <TaskCard
                      task={task}
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    />
                  </div>
                </div>
              ))}
               <div
                onDragOver={(e) => handleDragOver(e, category, null)}
                className={cn(
                  'h-0 rounded-lg transition-all duration-150',
                  dropTarget?.category === category && dropTarget.taskId === null
                    ? 'h-14 bg-primary/20 border-2 border-dashed border-primary my-1'
                    : ''
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
