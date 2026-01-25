import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMobileNotifications } from '../../src/hooks/useMobileNotifications';
import { LogMessage } from '../../src/types';

// Mock useWindowSize
vi.mock('../../src/hooks/useWindowSize', () => ({
  useWindowSize: vi.fn(),
}));

import { MockedFunction } from 'vitest';
import { useWindowSize } from '../../src/hooks/useWindowSize';

const mockUseWindowSize = useWindowSize as MockedFunction<typeof useWindowSize>;

describe('useMobileNotifications', () => {
  const mockAddNotification = vi.fn();
  const now = Date.now();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not trigger notification on desktop', () => {
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

    const { rerender } = renderHook(
      ({ logs }) => useMobileNotifications(logs, mockAddNotification),
      { initialProps: { logs: [] as LogMessage[] } }
    );

    const newLogs: LogMessage[] = [
      { id: '1', text: 'Test log', type: 'info', timestamp: now + 1000 },
    ];

    rerender({ logs: newLogs });

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should trigger notification on mobile when new log with newer timestamp is added', () => {
    mockUseWindowSize.mockReturnValue({ width: 500, height: 800 });
    const initialLogs: LogMessage[] = [{ id: '1', text: 'Old log', type: 'info', timestamp: now }];

    const { rerender } = renderHook(
      ({ logs }) => useMobileNotifications(logs, mockAddNotification),
      { initialProps: { logs: initialLogs } }
    );

    const newLogs: LogMessage[] = [
      { id: '2', text: 'New mobile log', type: 'info', timestamp: now + 1000 }, // Newer
      { id: '1', text: 'Old log', type: 'info', timestamp: now },
    ];

    rerender({ logs: newLogs });

    expect(mockAddNotification).toHaveBeenCalledTimes(1);
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'SYSTEM UPDATE',
        message: 'New mobile log',
        variant: 'info',
      })
    );
  });

  it('should ignore logs that are older than the last seen timestamp (e.g. initial load)', () => {
    mockUseWindowSize.mockReturnValue({ width: 500, height: 800 });
    const existingLogs: LogMessage[] = [{ id: '1', text: 'Old log', type: 'info', timestamp: now }];

    // Initial render sets baseline to 'now'
    const { rerender } = renderHook(
      ({ logs }) => useMobileNotifications(logs, mockAddNotification),
      { initialProps: { logs: existingLogs } }
    );

    expect(mockAddNotification).not.toHaveBeenCalled();

    // Rerender with SAME logs
    rerender({ logs: existingLogs });
    expect(mockAddNotification).not.toHaveBeenCalled();

    // Rerender with an OLDER log inserted (should not trigger)
    const mixedLogs = [
      { id: '0', text: 'Ancient log', type: 'info', timestamp: now - 1000 },
      ...existingLogs,
    ];
    rerender({ logs: mixedLogs });
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should correctly handle prepended logs (newest first array)', () => {
    mockUseWindowSize.mockReturnValue({ width: 500, height: 800 });
    const initialLogs: LogMessage[] = [];

    const { rerender } = renderHook(
      ({ logs }) => useMobileNotifications(logs, mockAddNotification),
      { initialProps: { logs: initialLogs } }
    );

    // Simulate unshift (prepended)
    const newLogs = [
      { id: '2', text: 'Brand New', type: 'warning', timestamp: now + 500 },
      { id: '1', text: 'Old', type: 'info', timestamp: now },
    ];

    rerender({ logs: newLogs });

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'WARNING',
        message: 'Brand New',
      })
    );
  });
});
