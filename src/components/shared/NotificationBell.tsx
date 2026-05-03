import { Bell } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;
  const notifications = useQuery(api.notifications.getMyNotifications) || [];
  const markAsRead = useMutation(api.notifications.markAsRead);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening dropdown
      markAsRead({});
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 border-2 border-white dark:border-gray-900 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-3 border-b border-gray-100 dark:border-gray-800 text-sm ${
                    !notif.isRead ? "bg-yellow-50 dark:bg-yellow-900/10" : ""
                  }`}
                >
                  <p className="text-gray-800 dark:text-gray-200">{notif.message}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
