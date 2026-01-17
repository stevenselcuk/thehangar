import { LogMessage } from '../types';

/**
 * Creates a log message object
 */
export const createLog = (
  text: string,
  type: LogMessage['type'] = 'info',
  timestamp: number = Date.now()
): LogMessage => {
  return {
    id: Math.random().toString(36),
    text,
    type,
    timestamp,
  };
};

/**
 * Adds a log to the logs array, maintaining max 50 logs
 */
export const addLogToArray = (
  logs: LogMessage[],
  text: string,
  type: LogMessage['type'] = 'info'
): LogMessage[] => {
  return [createLog(text, type), ...logs.slice(0, 49)];
};

/**
 * Checks if a resource cost can be afforded
 */
export const checkCost = (
  available: number,
  required: number,
  resourceName: string
): { canAfford: boolean; message?: string } => {
  if (required > 0 && available < required) {
    return {
      canAfford: false,
      message: `Insufficient ${resourceName}. Need ${required}, have ${available}.`,
    };
  }
  return { canAfford: true };
};

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
