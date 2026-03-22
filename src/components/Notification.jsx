import { useApp } from '../context/AppContext';

export default function Notification() {
  const { notifications } = useApp();

  if (notifications.length === 0) return null;

  const typeStyles = {
    success: 'border-l-4 border-green-500 bg-green-500/10',
    levelup: 'border-l-4 border-amber-500 bg-amber-500/10',
    badge: 'border-l-4 border-purple-500 bg-purple-500/10',
    error: 'border-l-4 border-red-500 bg-red-500/10',
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-4 max-w-md">
      {notifications.map((n, i) => (
        <div
          key={n.id}
          className={`animate-toast-in rounded-xl px-6 py-4 shadow-lg backdrop-blur-sm ${typeStyles[n.type] || typeStyles.success}`}
          style={{ animationDelay: `${i * 80}ms`, background: 'var(--toast-bg)' }}
        >
          <p className="font-body font-bold" style={{ color: 'var(--color-text-heading)' }}>{n.message}</p>
        </div>
      ))}
    </div>
  );
}
