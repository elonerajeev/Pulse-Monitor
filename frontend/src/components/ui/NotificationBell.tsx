import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from './button';

export interface Notification {
  id: string | number;
  message: string;
  service: string;
  time: string;
  severity: 'warning' | 'success' | 'info' | 'error';
}

interface NotificationBellProps {
  notifications: Notification[];
  onClear: (id: string | number) => void;
  onClearAll: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onClear, onClearAll }) => {
  const [showAll, setShowAll] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const unreadCount = notifications.length;
  const initialCount = 5;

  const notificationsToShow = showAll ? notifications : notifications.slice(0, initialCount);

  useEffect(() => {
    if (!isPopoverOpen) {
      setShowAll(false);
    }
  }, [isPopoverOpen]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Notifications</h4>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { onClearAll(); setShowAll(false); }}>Clear All</Button>
            )}
          </div>
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notificationsToShow.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      notification.severity === 'warning' ? 'bg-yellow-500' :
                      notification.severity === 'success' ? 'bg-green-500' :
                      notification.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.service} • {notification.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => onClear(notification.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {notifications.length > initialCount && !showAll && (
                  <div className="text-center">
                    <Button variant="link" className="text-sm" onClick={() => setShowAll(true)}>
                      Show More ({notifications.length - initialCount} more)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">No new notifications</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
