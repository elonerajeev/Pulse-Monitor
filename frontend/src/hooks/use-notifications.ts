import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/components/ui/NotificationBell';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time'>) => {
    const newNotification: Notification = {
      ...notification,
      id: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => {
      const updatedNotifications = [newNotification, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  }, []);

  const clearNotification = (id: string | number) => {
    setNotifications((prev) => {
      const updatedNotifications = prev.filter((n) => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  return { notifications, addNotification, clearNotification, clearAllNotifications };
};

export default useNotifications;
