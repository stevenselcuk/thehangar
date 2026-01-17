import ErrorBoundary from '@/components/ErrorBoundary';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    localStorage.clear();
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors and display error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/FATAL EXCEPTION/i)).toBeInTheDocument();
    expect(screen.getByText(/critical error/i)).toBeInTheDocument();
  });

  it('should display reboot button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const rebootButton = screen.getByRole('button', { name: /REBOOT/i });
    expect(rebootButton).toBeInTheDocument();
  });

  it.skip('should clear localStorage on reboot (requires full DOM)', async () => {
    const user = userEvent.setup();

    // Set up some save data
    localStorage.setItem('the_hangar_save', 'test-data');
    localStorage.setItem('the_hangar_save_backup', 'backup-data');
    localStorage.setItem('other_key', 'should-remain');

    // Mock window.location.reload
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const rebootButton = screen.getByRole('button', { name: /REBOOT/i });
    await user.click(rebootButton);

    // Verify game save data was cleared (keys starting with 'the_hangar_save')
    expect(localStorage.getItem('the_hangar_save')).toBeNull();
    expect(localStorage.getItem('the_hangar_save_backup')).toBeNull();

    // Verify other data remains
    expect(localStorage.getItem('other_key')).toBe('should-remain');

    // Verify reload was called
    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should log error details to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // ErrorBoundary logs errors - just verify it was called
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle localStorage errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock localStorage.removeItem to throw error
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => {
      throw new Error('Storage error');
    });

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const rebootButton = screen.getByRole('button', { name: /REBOOT/i });
    await user.click(rebootButton);

    // Should still reload even if localStorage fails
    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore
    localStorage.removeItem = originalRemoveItem;
  });

  it('should display error message styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const heading = screen.getByText(/FATAL EXCEPTION/i);
    expect(heading).toHaveClass('text-6xl');

    const button = screen.getByRole('button', { name: /REBOOT/i });
    expect(button).toHaveClass('border-red-600');
  });
});
