import React, { useState, useMemo } from 'react';
import { Task, Category, FilterState } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { calculateStatistics, exportTasksToCSV, generateId } from './utils/taskUtils';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import { StatisticsCard } from './components/StatisticsCard';
import { FilterBar } from './components/FilterBar';
import { Plus, FolderOpen, BarChart3, Settings, Bell } from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Work', color: '#3B82F6', createdAt: new Date().toISOString() },
  { id: '2', name: 'Personal', color: '#10B981', createdAt: new Date().toISOString() },
  { id: '3', name: 'Health', color: '#F59E0B', createdAt: new Date().toISOString() }
];

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('taskflow-tasks', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('taskflow-categories', DEFAULT_CATEGORIES);
  const [activeView, setActiveView] = useState<'tasks' | 'categories' | 'statistics'>('tasks');
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('taskflow-notifications', true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    category: ''
  });

  useNotifications(tasks, notificationsEnabled);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesCategory = !filters.category || task.categoryId === filters.category;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    }).sort((a, b) => {
      // Sort by priority first (High > Medium > Low), then by due date
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filters]);

  const statistics = useMemo(() => calculateStatistics(tasks), [tasks]);

  const handleSaveTask = (task: Task) => {
    setTasks(prev => {
      const existing = prev.find(t => t.id === task.id);
      if (existing) {
        return prev.map(t => t.id === task.id ? task : t);
      }
      return [...prev, task];
    });
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));
  };

  const handleSaveCategory = (category: Category) => {
    setCategories(prev => {
      const existing = prev.find(c => c.id === category.id);
      if (existing) {
        return prev.map(c => c.id === category.id ? category : c);
      }
      return [...prev, category];
    });
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? Tasks in this category will remain but be uncategorized.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      // Update tasks to remove the deleted category
      setTasks(prev => prev.map(task => 
        task.categoryId === id ? { ...task, categoryId: categories[0]?.id || '' } : task
      ));
    }
  };

  const handleExport = () => {
    const csvContent = exportTasksToCSV(filteredTasks, categories);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openTaskModal = (task?: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">TaskFlow</h1>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeView === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderOpen size={20} />
                Tasks
              </button>
              
              <button
                onClick={() => setActiveView('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeView === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                Categories
              </button>
              
              <button
                onClick={() => setActiveView('statistics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeView === 'statistics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={20} />
                Statistics
              </button>
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  notificationsEnabled ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} />
                Notifications {notificationsEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeView === 'tasks' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <button
                  onClick={() => openTaskModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              </div>

              <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                onExport={handleExport}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categories.find(c => c.id === task.categoryId)}
                    onEdit={openTaskModal}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleTaskStatus}
                  />
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No tasks found. Create your first task!</p>
                </div>
              )}
            </>
          )}

          {activeView === 'categories' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <button
                  onClick={() => openCategoryModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {tasks.filter(t => t.categoryId === category.id).length} tasks
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeView === 'statistics' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
              <div className="max-w-md">
                <StatisticsCard statistics={statistics} />
              </div>
            </>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
}

export default App;