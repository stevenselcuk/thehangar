import { createContext } from 'react';
import { Notification } from '../types.ts';

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'isExiting'> & { id?: string }
  ) => string;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
