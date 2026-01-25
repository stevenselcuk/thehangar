import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SystemModal from '../../src/components/common/SystemModal';

describe('SystemModal', () => {
  it('renders nothing when not open', () => {
    render(<SystemModal isOpen={false} title="Test Modal" />);
    expect(screen.queryByText('Test Modal')).toBeNull();
  });

  it('renders title and children when open', () => {
    render(
      <SystemModal isOpen={true} title="Test Modal">
        <p>Modal Content</p>
      </SystemModal>
    );

    expect(screen.getByText('Test Modal')).toBeDefined();
    expect(screen.getByText('Modal Content')).toBeDefined();
  });

  it('calls onClose when backdrop is clicked (if blocking)', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <SystemModal isOpen={true} isBlocking={true} onClose={handleClose} />
    );

    // The first child of the fragment is the backdrop
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render backdrop when not blocking', () => {
    // Use a distinct class or attribute to identify the backdrop if possible,
    // or check if the implementation renders it.
    // In our implementation, backdrop is null if !isBlocking.
    const { container } = render(<SystemModal isOpen={true} isBlocking={false} />);
    // We expect only one top-level div (the modal wrapper), not two (backdrop + wrapper)
    // Actually container will have the modal wrapper div as children.
    // If backdrop exists, it would be a fixed div before the modal wrapper.
    const firstChild = container.firstChild as HTMLElement;
    // The modal wrapper has z-[150], the backdrop has z-[100] and bg-black/80
    expect(firstChild.className).toContain('z-[150]');
    expect(firstChild.className).not.toContain('bg-black/80');
  });

  it('renders actions and handles clicks', () => {
    const handleAction = vi.fn();
    const actions = [{ label: 'Confirm', onClick: handleAction }];

    render(<SystemModal isOpen={true} actions={actions} />);

    const button = screen.getByText('Confirm');
    fireEvent.click(button);

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('auto closes after duration', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    render(<SystemModal isOpen={true} onClose={handleClose} autoCloseDuration={1000} />);

    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('renders variant styles correctly', () => {
    const { rerender } = render(
      <SystemModal isOpen={true} variant="danger" title="Danger Modal" />
    );
    let modal = screen.getByText('Danger Modal');
    // Check for red text/border class presence (heuristic)
    expect(modal.className).toContain('text-red-500');

    rerender(<SystemModal isOpen={true} variant="warning" title="Warning Modal" />);
    modal = screen.getByText('Warning Modal');
    expect(modal.className).toContain('text-amber-500');
  });
});
