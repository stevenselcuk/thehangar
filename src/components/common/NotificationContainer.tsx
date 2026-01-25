import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import SystemNotification from './SystemNotification';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 left-0 right-0 md:left-auto md:right-4 z-[2000] flex flex-col items-center md:items-end space-y-3 pointer-events-none px-4 md:p-4 max-h-screen overflow-hidden">
      {notifications.map((notification) => (
        <SystemNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
