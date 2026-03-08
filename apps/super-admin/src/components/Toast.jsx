import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';

export default function Toast() {
  const { notifications, removeNotification } = useNotificationStore();

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/50',
          text: 'text-emerald-300',
          icon: CheckCircle,
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-300',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-300',
          icon: Info,
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type);
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3 animate-slide-up`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.text}`} />
            <p className={`flex-1 text-sm ${styles.text}`}>{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 ${styles.text} hover:opacity-75 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
