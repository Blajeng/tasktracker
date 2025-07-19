import { useEffect } from 'react';
import { Task } from '../types';

export function useNotifications(tasks: Task[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;

    // Request permission for notifications
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      tasks
        .filter(task => task.status !== 'Done')
        .forEach(task => {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Show notification for tasks due tomorrow
          if (daysDiff === 1 && Notification.permission === 'granted') {
            new Notification(`Task Due Tomorrow: ${task.title}`, {
              body: `Priority: ${task.priority}`,
              icon: '/vite.svg'
            });
          }
        });
    };

    // Check reminders every hour
    const interval = setInterval(checkReminders, 3600000);
    return () => clearInterval(interval);
  }, [tasks, enabled]);
}