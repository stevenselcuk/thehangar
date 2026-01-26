import React, { useCallback, useReducer } from 'react';
import { Notification } from '../types.ts';
import { NotificationContext } from './NotificationContextDefinition.ts';

type Action =
  | { type: 'ADD'; payload: Notification }
  | { type: 'REMOVE'; payload: string }
  | { type: 'EXIT'; payload: string };

const notificationReducer = (state: Notification[], action: Action): Notification[] => {
  switch (action.type) {
    case 'ADD':
      if (state.some((n) => n.id === action.payload.id)) {
        return state; // Duplicate, ignore
      }
      return [...state, action.payload];
    case 'EXIT':
      return state.map((n) => (n.id === action.payload ? { ...n, isExiting: true } : n));
    case 'REMOVE':
      return state.filter((n) => n.id !== action.payload);
    default:
      return state;
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const removeNotification = useCallback((id: string) => {
    // Trigger exit animation first
    dispatch({ type: 'EXIT', payload: id });
    // Remove after animation (approx match CSS transition)
    setTimeout(() => {
      dispatch({ type: 'REMOVE', payload: id });
    }, 400);
  }, []);

  interface AddNotificationOptions extends Omit<Notification, 'id' | 'isExiting'> {
    id?: string;
  }

  const addNotification = useCallback(
    (notification: AddNotificationOptions) => {
      // stable ID or random
      const id = notification.id || Math.random().toString(36).substring(2, 9);

      // Check if exists to prevent duplicates if ID is provided
      // We can't access state easily inside useCallback without adding it to deps (causing loops).
      // Instead use functional update in dispatch or check duplicates in reducer?
      // Dispatching 'ADD' is fine, let's handle deduplication in reducer.

      dispatch({ type: 'ADD', payload: { ...notification, id } });

      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration);
      }
      return id;
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
