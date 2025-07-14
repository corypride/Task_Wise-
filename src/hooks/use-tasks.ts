"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { adjustTaskCategories as adjustTaskCategoriesFlow } from '@/ai/flows/adjust-task-categories';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'taskwise-ai-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage', error);
      }
    }
  }, [tasks, isInitialized]);
  
  const handleSetTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), completed: false };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates } : task)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const reorderTasks = useCallback((draggedTaskId: string, targetTaskId: string | null, targetCategory: string) => {
    setTasks(currentTasks => {
      const draggedTask = currentTasks.find(t => t.id === draggedTaskId);
      if (!draggedTask) return currentTasks;

      const tasksWithoutDragged = currentTasks.filter(t => t.id !== draggedTaskId);
      const targetIndex = tasksWithoutDragged.findIndex(t => t.id === targetTaskId);

      const updatedTask = { ...draggedTask, category: targetCategory };
      
      if (targetTaskId === null) {
        // Dropped on a category, append to the end of that category
        const categoryTasks = tasksWithoutDragged.filter(t => t.category === targetCategory);
        const otherTasks = tasksWithoutDragged.filter(t => t.category !== targetCategory);
        return [...otherTasks, ...categoryTasks, updatedTask];
      } else {
        tasksWithoutDragged.splice(targetIndex, 0, updatedTask);
        return tasksWithoutDragged;
      }
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
