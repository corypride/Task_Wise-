
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { adjustTaskCategories as adjustTaskCategoriesFlow } from '@/ai/flows/adjust-task-categories';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'taskwise-ai-tasks';
const COMPLETED_STORAGE_KEY = 'taskwise-ai-completed-tasks';
const TRASH_RETENTION_DAYS = 7;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      const storedCompletedTasks = localStorage.getItem(COMPLETED_STORAGE_KEY);
      if (storedCompletedTasks) {
        const parsedCompleted: Task[] = JSON.parse(storedCompletedTasks);
        const now = Date.now();
        const retentionPeriod = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        
        const keptTasks: Task[] = [];
        let removedCount = 0;

        for (const task of parsedCompleted) {
          if (task.completedAt && now - task.completedAt < retentionPeriod) {
            keptTasks.push(task);
          } else {
            removedCount++;
          }
        }
        
        setCompletedTasks(keptTasks);

        if (removedCount > 0) {
          toast({
            title: 'Tasks Cleared',
            description: `${removedCount} completed task${removedCount > 1 ? 's' : ''} older than ${TRASH_RETENTION_DAYS} days have been removed.`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage', error);
    } finally {
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(completedTasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage', error);
      }
    }
  }, [tasks, completedTasks, isInitialized]);
  
  const handleSetTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), completed: false };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    if (updates.completed === true) {
      const taskToComplete = tasks.find(t => t.id === id);
      if (taskToComplete) {
        setTasks(prev => prev.filter(t => t.id !== id));
        setCompletedTasks(prev => [{ ...taskToComplete, ...updates, completedAt: Date.now() }, ...prev]);
      }
    } else if (updates.completed === false) {
        const taskToUncomplete = completedTasks.find(t => t.id === id);
        if (taskToUncomplete) {
            setCompletedTasks(prev => prev.filter(t => t.id !== id));
            const { completedAt, ...rest } = taskToUncomplete;
            setTasks(prev => [{ ...rest, ...updates }, ...prev]);
        }
    } else {
        setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates } : task)));
        setCompletedTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates } : task)));
    }
  }, [tasks, completedTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setCompletedTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const reorderTasks = useCallback((draggedTaskId: string, targetTaskId: string | null, targetCategory: string) => {
    setTasks(currentTasks => {
      const draggedTask = currentTasks.find(t => t.id === draggedTaskId);
      if (!draggedTask) return currentTasks;

      // Create a new list without the dragged task
      const tasksWithoutDragged = currentTasks.filter(t => t.id !== draggedTaskId);
      
      // Find the target index in the filtered list
      const targetIndex = targetTaskId ? tasksWithoutDragged.findIndex(t => t.id === targetTaskId) : -1;

      // Update the dragged task's category
      const updatedDraggedTask = { ...draggedTask, category: targetCategory };

      // Create the new list with the task in its new position
      let reorderedTasks: Task[];
      if (targetIndex !== -1) {
        tasksWithoutDragged.splice(targetIndex, 0, updatedDraggedTask);
        reorderedTasks = tasksWithoutDragged;
      } else {
        // If dropped on category header (targetTaskId is null), add to the end
        reorderedTasks = [...tasksWithoutDragged, updatedDraggedTask];
      }

      // Now, re-calculate priorities for all tasks in the affected categories
      const affectedCategories = new Set([draggedTask.category, targetCategory]);

      return reorderedTasks.map(task => {
        if (affectedCategories.has(task.category)) {
          // Filter tasks of the same category, sort them, and re-assign priority
          const categoryTasks = reorderedTasks
            .filter(t => t.category === task.category)
            .sort((a,b) => a.priority - b.priority); // sort by old priority first
          
          const newPriority = categoryTasks.findIndex(t => t.id === task.id) + 1;
          
          if (newPriority > 0) {
            return { ...task, priority: newPriority };
          }
        }
        return task;
      }).map(task => { // Second pass to re-assign priorities based on order
        const categoryTasks = reorderedTasks.filter(t => t.category === task.category);
        const newPriority = categoryTasks.findIndex(t => t.id === task.id) + 1;
        return {...task, priority: newPriority};
      });
    });
  }, []);

  const adjustCategories = useCallback(async (instructions: string) => {
    if (tasks.length === 0) {
        toast({ title: 'No tasks to adjust', variant: 'destructive' });
        return;
    }

    const flowInput = {
        taskList: tasks.map(({ id, title, category }) => ({ id, title, category })),
        instructions,
    };

    try {
        const updatedCategoryList = await adjustTaskCategoriesFlow(flowInput);
        const updates = new Map(updatedCategoryList.map(t => [t.id, t.category]));

        setTasks(currentTasks => 
            currentTasks.map(task => ({
                ...task,
                category: updates.get(task.id) || task.category,
            }))
        );
        toast({ title: 'Categories adjusted successfully!' });
    } catch (error) {
        console.error('AI category adjustment failed:', error);
        toast({ title: 'Adjustment Failed', description: 'The AI could not adjust categories. Please try again.', variant: 'destructive' });
        throw error;
    }
  }, [tasks, toast]);

  const renameCategory = useCallback((oldCategory: string, newCategory: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.category === oldCategory ? { ...task, category: newCategory } : task
      )
    );
    toast({ title: `Category renamed to "${newCategory}"`});
  }, [toast]);


  return {
    tasks,
    completedTasks,
    setTasks: handleSetTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    adjustCategories,
    renameCategory,
    isInitialized,
  };
}
