import { useEffect, useRef } from 'react';
import { Notification } from '../context/NotificationContext';
import { LogMessage } from '../types';
import { getNotificationVariantForLogType } from '../utils/logUtils';
import { useWindowSize } from './useWindowSize';

export const useMobileNotifications = (
  logs: LogMessage[],
  addNotification: (
    notification: Omit<Notification, 'id' | 'isExiting'> & { id?: string }
  ) => string
) => {
  const { width } = useWindowSize();
  // Track the timestamp of the latest log we have already seen/notified
  const lastSeenTimestampRef = useRef<number>(0);

  // Initialize on mount with the current latest log timestamp so we don't notify for existing logs
  useEffect(() => {
    if (logs.length > 0) {
      // Find max timestamp in current logs
      const maxTime = Math.max(...logs.map((l) => l.timestamp));
      lastSeenTimestampRef.current = maxTime;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to set initial baseline

  const isMobile = width < 768; // MD breakpoint

  useEffect(() => {
    if (!isMobile || logs.length === 0) return;

    // Find the absolute newest log by timestamp
    // We sort a copy or just use reduce to avoid mutating if logs was mutable (it's likely immutable from redux)
    // But since we just need one, simple iteration is fine.

    // Efficiently find newest log
    let newestLog: LogMessage | null = null;
    let maxTime = -1;

    for (const log of logs) {
      if (log.timestamp > maxTime) {
        maxTime = log.timestamp;
        newestLog = log;
      }
    }

    if (newestLog && newestLog.timestamp > lastSeenTimestampRef.current) {
      // It's a new log we haven't seen

      const variant = getNotificationVariantForLogType(newestLog.type);

      let title = 'SYSTEM LOG';
      if (newestLog.type === 'story') title = 'STORY EVENT';
      else if (newestLog.type === 'error') title = 'CRITICAL ERROR';
      else if (newestLog.type === 'warning') title = 'WARNING';
      else if (newestLog.type === 'levelup') title = 'LEVEL UP';
      else if (newestLog.type === 'vibration') title = 'ANOMALY DETECTED';
      else if (newestLog.type === 'info') title = 'SYSTEM UPDATE';

      addNotification({
        id: `log-${newestLog.id}-${Date.now()}`,
        title,
        message: newestLog.text,
        variant: variant,
        duration: 3000,
      });

      // Update our tracker
      lastSeenTimestampRef.current = newestLog.timestamp;
    }
  }, [logs, isMobile, addNotification]);
};
