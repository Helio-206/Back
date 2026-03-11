import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
  schedule?: {
    id: string;
    scheduledDate: string;
    center?: { name: string; provincia: string };
    tipoServico?: { descricao: string };
  };
}

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const { data } = await api.get('/notifications');
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count');
    return data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
