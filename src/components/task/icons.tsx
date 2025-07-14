"use client";

import { ClipboardList, Search, Wrench, CheckCircle2, Tag, Book, Code, ShoppingCart, type LucideIcon } from 'lucide-react';

export const getIconForCategory = (category: string): LucideIcon => {
  const lowerCaseCategory = category.toLowerCase();
  if (lowerCaseCategory.includes('plan')) return ClipboardList;
  if (lowerCaseCategory.includes('research')) return Search;
  if (lowerCaseCategory.includes('execut') || lowerCaseCategory.includes('develop') || lowerCaseCategory.includes('implement')) return Wrench;
  if (lowerCaseCategory.includes('review') || lowerCaseCategory.includes('test')) return CheckCircle2;
  if (lowerCaseCategory.includes('content') || lowerCaseCategory.includes('writing')) return Book;
  if (lowerCaseCategory.includes('code') || lowerCaseCategory.includes('backend') || lowerCaseCategory.includes('frontend')) return Code;
  if (lowerCaseCategory.includes('market') || lowerCaseCategory.includes('sale')) return ShoppingCart;
  return Tag;
};
