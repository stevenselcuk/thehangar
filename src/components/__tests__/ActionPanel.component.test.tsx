import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AircraftType, GameEvent, GameState, TabType } from '../../types';
import ActionPanel from '../ActionPanel';

// Mock ComponentInspectionModal since we just want to test it opens
vi.mock('../ComponentInspectionModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="component-inspection-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockPanelState: GameState = {
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

describe('ActionPanel UI Integration', () => {
  const mockState = mockPanelState;

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

describe('ActionPanel requiredAction affordance', () => {
  beforeEach(() => {
    // jsdom has no layout engine; ActionPanel scrolls the panel into view
    // whenever an event appears.
    Element.prototype.scrollIntoView = vi.fn();
  });

  const eventState = (requiredAction: string): GameState =>
    ({
      ...mockPanelState,
      activeEvent: {
        id: 'TEST_PANEL_EVENT',
        type: 'accident',
        title: 'A Timed Task',
        description: 'test',
        timeLeft: 20000,
        totalTime: 30000,
        requiredAction,
        successOutcome: { log: 'Done.', effects: {} },
        failureOutcome: { log: 'Missed.' },
      } as GameEvent,
    }) as GameState;

  const renderPanel = (state: GameState, onAction = vi.fn()) => {
    render(
      <ActionPanel
        activeTab={TabType.HANGAR}
        state={state}
        onAction={onAction}
        onOpenBulletinBoard={vi.fn()}
      />
    );
    return onAction;
  };

  it('shows the read-only placard when the required action is routable', () => {
    renderPanel(eventState('PERFORM_NDT'));

    expect(screen.getByText(/Required: PERFORM NDT/i)).toBeInTheDocument();
    expect(screen.queryByText('DISCARD')).not.toBeInTheDocument();
  });

  it('offers DISCARD instead when the required action names nothing routable', () => {
    // The structural guard: prose the engine cannot act on must never leave
    // the player with a guaranteed timeout and no button.
    const onAction = renderPanel(eventState('Isolate System B per AMM 29-11-00'));

    expect(screen.queryByText(/^Required:/i)).not.toBeInTheDocument();
    const discard = screen.getByText('DISCARD');
    expect(discard).toBeInTheDocument();

    fireEvent.click(discard);
    expect(onAction).toHaveBeenCalledWith('RESOLVE_EVENT');
  });
});
