
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  userId: string;
  type: 'recipe_share' | 'comment' | 'like';
  message: string;
  recipeId?: string;
  fromUserId?: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Load notifications for the current user
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('notifications') || '[]';
      const allNotifications: Notification[] = JSON.parse(storedNotifications);
      
      // Filter notifications for the current user
      const userNotifications = allNotifications.filter(
        (notification) => notification.userId === user.id
      );
      
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    };

    loadNotifications();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    const storedNotifications = localStorage.getItem('notifications') || '[]';
    const allNotifications: Notification[] = JSON.parse(storedNotifications);
    
    const updatedNotifications = allNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    );
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    setNotifications(updatedNotifications.filter(
      (notification) => notification.userId === user?.id
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.recipeId) {
      navigate(`/recipe/${notification.recipeId}`);
    } else if (notification.fromUserId) {
      navigate(`/profile/${notification.fromUserId}`);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    const storedNotifications = localStorage.getItem('notifications') || '[]';
    const allNotifications: Notification[] = JSON.parse(storedNotifications);
    
    const updatedNotifications = allNotifications.map(notification => 
      notification.userId === user.id 
        ? { ...notification, read: true } 
        : notification
    );
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    setNotifications(updatedNotifications.filter(
      (notification) => notification.userId === user?.id
    ));
    
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge className="h-2 w-2 rounded-full bg-blue-500 p-0" />
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
