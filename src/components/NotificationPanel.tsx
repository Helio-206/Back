import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Info, CircleAlert, CircleCheck, X } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../services/notification.service';
import styles from './NotificationPanel.module.css';

interface Props {
  accentColor?: string;
}

export default function NotificationPanel({ accentColor = '#C41E24' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      /* silent */
    }
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONFIRMATION':
        return <CircleCheck size={16} className={styles.iconGreen} />;
      case 'REJECTION':
        return <CircleAlert size={16} className={styles.iconRed} />;
      case 'STATUS_CHANGE':
        return <Info size={16} className={styles.iconBlue} />;
      default:
        return <Info size={16} className={styles.iconGray} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={styles.container} ref={panelRef}>
      <button
        className={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: accentColor }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge} style={{ background: accentColor }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notificações</span>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllBtn}
                  onClick={handleMarkAllRead}
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className={styles.dropdownBody}>
            {loading ? (
              <div className={styles.dropdownEmpty}>A carregar...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.dropdownEmpty}>
                Sem notificações
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.notifItem} ${
                    !notif.read ? styles.notifUnread : ''
                  }`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  <div className={styles.notifIcon}>{getIcon(notif.type)}</div>
                  <div className={styles.notifContent}>
                    <span className={styles.notifTitle}>{notif.title}</span>
                    <span className={styles.notifMessage}>{notif.message}</span>
                    <span className={styles.notifTime}>
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.read && (
                    <button
                      className={styles.readBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      title="Marcar como lida"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
