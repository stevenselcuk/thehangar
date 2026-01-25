import { NotificationVariant } from '../context/NotificationContext';
import { LogMessage } from '../types';

export const getLogStyles = (type: LogMessage['type']) => {
  switch (type) {
    case 'info':
      return {
        container: 'border-emerald-900 text-emerald-400',
        prefix: '[ OK ]',
        animation: '',
      };
    case 'warning':
      return {
        container: 'border-amber-700 text-amber-500 log-warning bg-amber-950/5',
        prefix: '[ !! ]',
        animation: '',
      };
    case 'error':
      return {
        container: 'border-red-900 text-red-600 font-bold bg-red-950/10',
        prefix: '[ CRIT ]',
        animation: 'vibrate',
      };
    case 'vibration':
      return {
        container: 'border-purple-900 text-purple-400 bg-purple-950/10',
        prefix: '[ ??? ]',
        animation: 'vibrate',
      };
    case 'story':
      return {
        container: 'border-emerald-500 text-emerald-100 log-story',
        prefix: '[ LOG ]',
        animation: 'animate-pulse',
      };
    case 'levelup':
      return {
        container: 'border-blue-500 text-blue-300 bg-blue-950/20 flicker',
        prefix: '[ LVL ]',
        animation: 'animate-pulse',
      };
    default:
      return {
        container: 'border-emerald-900 text-emerald-300',
        prefix: '[ MSG ]',
        animation: '',
      };
  }
};

export const getNotificationVariantForLogType = (type: LogMessage['type']): NotificationVariant => {
  switch (type) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    case 'vibration':
      return 'system'; // Or a custom 'hazard' if appropriate
    case 'story':
      return 'default';
    case 'levelup':
      return 'levelup';
    default:
      return 'default';
  }
};
