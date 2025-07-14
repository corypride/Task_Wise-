"use client";

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Task } from '@/lib/types';
import { Wand2, Loader2 } from 'lucide-react';

interface AdjustCategoriesDialogProps {
  tasks: Task[];
  onAdjust: (instructions: string) => Promise<void>;
}

export function AdjustCategoriesDialog({ tasks, onAdjust }: AdjustCategoriesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const handleAdjust = async () => {
    if (!instructions.trim() || tasks.length === 0) return;
    setIsAdjusting(true);
    try {
      await onAdjust(instructions);
      setIsOpen(false);
      setInstructions('');
    } catch (error) {
      console.error('Failed to adjust categories:', error);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={tasks.length === 0}>
          <Wand2 className="mr-2 h-4 w-4" />
          Adjust Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Categories with AI</DialogTitle>
          <DialogDescription>
            Use natural language to reorganize your tasks. For example, &quot;Group all design tasks into a 'Design' category&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructions" className="text-right">
              Instructions
            </Label>
            <Input
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Move 'Create wireframes' to 'Planning'"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdjust} disabled={isAdjusting || !instructions.trim()}>
            {isAdjusting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Adjust
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
