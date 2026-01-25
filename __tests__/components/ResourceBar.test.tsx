import ResourceBar from '@/components/ResourceBar';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { midGameState } from '../fixtures/gameStates';

describe('ResourceBar', () => {
  it('renders core resources correctly', () => {
    render(
      <ResourceBar
        resources={midGameState.resources}
        inventory={midGameState.inventory}
        hfStats={midGameState.hfStats}
        flags={midGameState.flags}
      />
    );

    // Use regex to flexible match
    const sanityElements = screen.getAllByText(/Sanity/i);
    expect(sanityElements.length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`${Math.floor(midGameState.resources.sanity)}%`).length
    ).toBeGreaterThan(0);

    expect(screen.getAllByText(/Suspicion/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`${Math.floor(midGameState.resources.suspicion)}%`).length
    ).toBeGreaterThan(0);

    expect(screen.getAllByText(/Focus/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`${Math.floor(midGameState.resources.focus)}%`).length
    ).toBeGreaterThan(0);
  });

  it('renders Level indicator', () => {
    render(
      <ResourceBar
        resources={midGameState.resources}
        inventory={midGameState.inventory}
        hfStats={midGameState.hfStats}
        flags={midGameState.flags}
      />
    );

    expect(screen.getByText(`LVL ${midGameState.resources.level}`)).toBeInTheDocument();
  });
});
