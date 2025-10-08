import React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface Notification {
  id: string | number;
  message: string;
  service: string;
  time: string;
  severity: 'warning' | 'success' | 'info' | 'error';
}

interface NotificationBellProps {
  notifications: Notification[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => {
  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
              {unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="p-4">
          <h4 className="font-medium">Notifications</h4>
          <div className="mt-4 space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    notification.severity === 'warning' ? 'bg-warning' :
                    notification.severity === 'success' ? 'bg-success' :
                    notification.severity === 'error' ? 'bg-destructive' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.service} • {notification.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No new notifications</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
