import { Tooltip } from '@/components/common/Tooltip';
import { fireEvent, render, screen, act } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button>Hover Me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover Me')).toBeInTheDocument();
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip Content" delay={200}>
        <button>Hover Me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover Me');
    fireEvent.mouseEnter(trigger);

    // Should not be visible yet
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should be visible now
    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip Content" delay={200}>
        <button>Hover Me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover Me');
    fireEvent.mouseEnter(trigger);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);

    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('cancels show timer on early mouse leave', () => {
    render(
      <Tooltip content="Tooltip Content" delay={200}>
        <button>Hover Me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover Me');
    fireEvent.mouseEnter(trigger);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.mouseLeave(trigger);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('renders complex content', () => {
      render(
      <Tooltip content={<span data-testid="complex">Complex</span>} delay={0}>
        <button>Hover Me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover Me');
    fireEvent.mouseEnter(trigger);

    act(() => {
        vi.runAllTimers();
    });

    expect(screen.getByTestId('complex')).toBeInTheDocument();
  });
});
