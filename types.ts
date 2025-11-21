export type Priority = 'low' | 'medium' | 'high';

export type Category = 'general' | 'work' | 'study' | 'personal' | 'health' | 'finance';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number; // Track when the task was completed for daily stats
  dueDate?: number;
  priority: Priority;
  category: Category;
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type AddToastFunction = (message: string, type: ToastType, duration?: number) => void;