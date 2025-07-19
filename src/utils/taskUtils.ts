import { Task, Category, Statistics } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-amber-600 bg-amber-50';
    case 'Low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Done': return 'text-green-600 bg-green-50';
    case 'In Progress': return 'text-blue-600 bg-blue-50';
    case 'To Do': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function calculateStatistics(tasks: Task[]): Statistics {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done');
  
  const completedToday = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  }).length;

  const completedThisWeek = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= weekStart;
  }).length;

  const pendingTasks = tasks.filter(task => task.status !== 'Done').length;
  
  const overdueTasks = tasks.filter(task => 
    task.status !== 'Done' && isOverdue(task.dueDate)
  ).length;

  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedToday,
    completedThisWeek,
    pendingTasks,
    overdueTasks,
    completionRate
  };
}

export function exportTasksToCSV(tasks: Task[], categories: Category[]): string {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  
  const headers = ['Title', 'Description', 'Due Date', 'Priority', 'Status', 'Category', 'Created At', 'Completed At'];
  
  const rows = tasks.map(task => [
    task.title,
    task.description,
    task.dueDate,
    task.priority,
    task.status,
    categoryMap.get(task.categoryId) || 'Uncategorized',
    task.createdAt,
    task.completedAt || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}