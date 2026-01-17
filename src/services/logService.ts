import { LogMessage } from '../types.ts';

/**
 * Centralized log creation utility
 * Replaces duplicate addLog() functions in gameReducer and tickProcessor
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
 * Add a log to the logs array (mutates draft in Immer context)
 * Maintains max 50 entries, newest first
 */
export const addLogToDraft = (
  logs: LogMessage[],
  text: string,
  type: LogMessage['type'] = 'info',
  timestamp: number = Date.now()
): void => {
  logs.unshift(createLog(text, type, timestamp));
  // Trim to max 50 entries
  if (logs.length > 50) {
    logs.splice(50);
  }
};

/**
 * Immutable version - returns new array
 */
export const addLogImmutable = (
  logs: LogMessage[],
  text: string,
  type: LogMessage['type'] = 'info',
  timestamp: number = Date.now()
): LogMessage[] => {
  const newLogs = [createLog(text, type, timestamp), ...logs];
  return newLogs.slice(0, 50);
};
