export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  categoryId: string;
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  status: string;
  priority: string;
  category: string;
}

export interface Statistics {
  totalTasks: number;
  completedToday: number;
  completedThisWeek: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}