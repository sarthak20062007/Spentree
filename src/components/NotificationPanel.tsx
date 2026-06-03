'use client';

import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function NotificationPanel() {
  const { notifications, showNotifications, toggleNotifications, markNotificationRead, clearNotifications } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!showNotifications) return null;

  const iconMap: Record<string, string> = {
    success: 'check_circle',
    warning: 'warning',
    info: 'info',
    xp: 'stars',
  };

  const colorMap: Record<string, string> = {
    success: 'text-secondary',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    xp: 'text-amber-500',
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={toggleNotifications}>
      <div
        className="absolute right-8 top-16 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
          <h3 className="font-headline font-bold text-primary">Notifications {unreadCount > 0 && <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full ml-2">{unreadCount}</span>}</h3>
          <button onClick={clearNotifications} className="text-xs text-outline hover:text-error transition-colors font-bold">Clear All</button>
        </div>
        <div className="overflow-y-auto max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-outline">
              <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">notifications_off</span>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer ${!n.read ? 'bg-surface-container-lowest' : ''}`}
                onClick={() => markNotificationRead(n.id)}
              >
                <span className={`material-symbols-outlined text-lg mt-0.5 ${colorMap[n.type]}`}>
                  {iconMap[n.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">{n.message}</p>
                  <p className="text-[10px] text-outline mt-1">{formatDate(n.timestamp)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
