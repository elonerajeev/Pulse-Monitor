import { useState, useEffect } from 'react';
import { Notification } from '@/components/ui/NotificationBell';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'time'>) => {
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
  };

  return { notifications, addNotification };
};

export default useNotifications;
