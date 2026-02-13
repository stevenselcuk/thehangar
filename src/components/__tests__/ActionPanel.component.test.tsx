import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AircraftType, GameState, TabType } from '../../types';
import ActionPanel from '../ActionPanel';

// Mock ComponentInspectionModal since we just want to test it opens
vi.mock('../ComponentInspectionModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="component-inspection-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('ActionPanel UI Integration', () => {
  const mockState: GameState = {
    resources: {
      credits: 1000,
      experience: 0,
      sanity: 100,
      focus: 100,
      suspicion: 0,
      fdrData: 0,
      aimsData: 0,
      flightComputerMemory: 0,
      kardexFragments: 0,
      level: 1,
      alclad: 100,
      titanium: 50,
    } as unknown as GameState['resources'],
    inventory: {} as unknown as GameState['inventory'],
    personalInventory: {},
    flags: {} as unknown as GameState['flags'],
    // hkStats removed
    logs: [],
    activeAircraft: {
      id: AircraftType.B737_400,
      task: 'TRANSIT_CHECK',
      installedRotables: [],
      // ... other props
    } as unknown as GameState['activeAircraft'], // activeAircraft is present
    pet: { location: 'OFFICE', flags: {} } as unknown as GameState['pet'],
    procurement: { catalogueUnlockLevel: 1, orders: [] } as unknown as GameState['procurement'],
    anomalies: [],
    toolConditions: {},
    calibrationMinigame: { active: false },
    mail: [],
  } as unknown as GameState;

  const mockOnAction = vi.fn();
  const mockOnOpenBulletinBoard = vi.fn();

  it('renders Inspect Components button in APRON_LINE tab when aircraft is active', () => {
    render(
      <ActionPanel
        activeTab={TabType.APRON_LINE}
        state={mockState}
        onAction={mockOnAction}
        onOpenBulletinBoard={mockOnOpenBulletinBoard}
      />
    );

    expect(screen.getByText(/Inspect Components/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Flight Data/i)).toBeInTheDocument();
  });

  it('opens ComponentInspectionModal when Inspect Components is clicked', () => {
    render(
      <ActionPanel
        activeTab={TabType.APRON_LINE}
        state={mockState}
        onAction={mockOnAction}
        onOpenBulletinBoard={mockOnOpenBulletinBoard}
      />
    );

    fireEvent.click(screen.getByText(/Inspect Components/i));
    expect(screen.getByTestId('component-inspection-modal')).toBeInTheDocument();
  });

  it('closes ComponentInspectionModal when close is clicked', () => {
    render(
      <ActionPanel
        activeTab={TabType.APRON_LINE}
        state={mockState}
        onAction={mockOnAction}
        onOpenBulletinBoard={mockOnOpenBulletinBoard}
      />
    );

    fireEvent.click(screen.getByText(/Inspect Components/i));
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('component-inspection-modal')).not.toBeInTheDocument();
  });
});
