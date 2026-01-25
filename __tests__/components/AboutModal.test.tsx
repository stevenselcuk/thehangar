import AboutModal from '@/components/AboutModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { midGameState } from '../fixtures/gameStates';

describe('AboutModal', () => {
  const mockOnAction = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Profile section by default', () => {
    render(<AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />);

    // Check for specific profile info from midGameState
    // Use getAllByText because "Logbook Hours" might appear in both sidebar and content, or multiple times
    // But in the content it is "Logbook Hours" label for stats
    expect(screen.getAllByText('Logbook Hours').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/120H/i).length).toBeGreaterThan(0); // 120 from midGameState
  });

  it('navigates to Field Competencies', () => {
    render(<AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />);

    const matrixButton = screen.getByRole('button', { name: /Field Competencies/i });
    fireEvent.click(matrixButton);

    expect(screen.getByText('Industrial Operations')).toBeInTheDocument();
    expect(screen.getByText('Anomaly Observation')).toBeInTheDocument();
  });

  it('navigates to Import/Export', () => {
    render(<AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />);

    const importExportButton = screen.getByRole('button', { name: /Import \/ Export/i });
    fireEvent.click(importExportButton);

    expect(screen.getByText(/Generate Export Code/i)).toBeInTheDocument();
  });

  it('navigates to About section', () => {
    render(<AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />);

    // Use regex to match exact "About" to avoid matching "AboutModal" or similar if text was different
    // The button text is "About"
    const aboutButtons = screen.getAllByRole('button', { name: /^About$/i });
    // There might be multiple or just one. The sidebar button is definitely one.
    fireEvent.click(aboutButtons[0]);

    expect(screen.getByText(/THE HANGAR is a text-based incremental RPG/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AboutModal state={midGameState} onAction={mockOnAction} onClose={mockOnClose} />);

    const closeButton = screen.getByText('[ CLOSE ]');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
