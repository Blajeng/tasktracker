import React from 'react';
import { Task, Category } from '../types';
import { formatDate, isOverdue, getPriorityColor, getStatusColor } from '../utils/taskUtils';
import { Edit, Trash2, Clock, Calendar, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  category: Category | undefined;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function TaskCard({ task, category, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const isTaskOverdue = isOverdue(task.dueDate) && task.status !== 'Done';

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
      isTaskOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${
            task.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          <Flag size={12} className="mr-1" />
          {task.priority}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          <Clock size={12} className="mr-1" />
          {task.status}
        </span>
        {category && (
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center text-sm ${isTaskOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          <Calendar size={14} className="mr-1" />
          {formatDate(task.dueDate)}
          {isTaskOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
        </div>
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            task.status === 'Done'
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {task.status === 'Done' ? 'Reopen' : 'Complete'}
        </button>
      </div>
    </div>
  );
}