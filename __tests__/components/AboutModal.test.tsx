import AboutModal from '@/components/AboutModal';
import { SoundProvider } from '@/context/SoundContext';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { midGameState } from '../fixtures/gameStates';

// Mock SoundContext if needed, or wrap with provider.
// Since we have a provider, wrapping is cleaner if it has no external deps hard to mock.
// However, SoundContext uses Audio API which might not be available in test environment (JSDOM).
// So we should verify if SoundProvider can run in JSDOM or if we mock the useSound hook.
// The error says "useSound must be used within a SoundProvider", implying the hook is running but context is missing.

// Let's mock the Audio object for JSDOM first
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  volume: 1,
  currentTime: 0,
}));

// We can wrap with the actual provider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<SoundProvider>{ui}</SoundProvider>);
};

describe('AboutModal', () => {
  const mockOnAction = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Profile section by default', () => {
    renderWithProviders(
      <AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />
    );

    // Check for "Personnel File" header from new UI
    expect(screen.getByText(/Personnel File/i)).toBeInTheDocument();
  });

  it('navigates to Field Competencies', () => {
    renderWithProviders(
      <AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />
    );

    const matrixButton = screen.getByText('COMPETENCY');
    fireEvent.click(matrixButton);

    expect(screen.getByText('Competency Matrix')).toBeInTheDocument();
  });

  it('navigates to Import/Export', () => {
    renderWithProviders(
      <AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />
    );

    const importExportButton = screen.getByText('SYS. MIGRATION');
    fireEvent.click(importExportButton);

    expect(screen.getByText(/DATA MIGRATION PROTOCOLS/i)).toBeInTheDocument();
  });

  it('navigates to About section', () => {
    renderWithProviders(
      <AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />
    );

    const aboutButton = screen.getByText('CREDITS');
    fireEvent.click(aboutButton);

    expect(screen.getByText(/Created by Steven Selcuk/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProviders(
      <AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />
    );

    const closeButton = screen.getByText('[ CLOSE TERMINAL ]');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
