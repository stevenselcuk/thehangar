import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGameAction } from '../../src/logic/actionProcessor';
import { createInitialState } from '../../src/state/initialState';
import { GameState } from '../../src/types';

describe('actionProcessor - UNLOCK_SKILL', () => {
  let state: GameState;
  const mockCreateJob = vi.fn();
  const mockTriggerEvent = vi.fn();

  beforeEach(() => {
    state = createInitialState();
    mockCreateJob.mockReset();
    mockTriggerEvent.mockReset();
  });

  it('should unlock a valid skill if points are available', () => {
    state.proficiency.skillPoints = 1;
    const skillId = 'scrapSavant'; // Tier 1

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(0);
    expect(nextState.proficiency.unlocked).toContain(skillId);
    expect(nextState.logs[0].text).toContain('PROFICIENCY UNLOCKED');
  });

  it('should not unlock if skill points are 0', () => {
    state.proficiency.skillPoints = 0;
    const skillId = 'scrapSavant';

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(0);
    expect(nextState.proficiency.unlocked).not.toContain(skillId);
  });

  it('should not unlock if already unlocked', () => {
    state.proficiency.skillPoints = 1;
    state.proficiency.unlocked = ['scrapSavant'];
    const skillId = 'scrapSavant';

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(1); // Should not consume point
    expect(nextState.logs.length).toBe(state.logs.length); // No new log
  });

  it('should not unlock if prerequisite is missing', () => {
    state.proficiency.skillPoints = 1;
    const skillId = 'nightShiftSupervisor'; // Requires scrapSavant

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(1);
    expect(nextState.proficiency.unlocked).not.toContain(skillId);
  });

  it('should unlock if prerequisite is met', () => {
    state.proficiency.skillPoints = 1;
    state.proficiency.unlocked = ['scrapSavant'];
    const skillId = 'nightShiftSupervisor'; // Requires scrapSavant

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(0);
    expect(nextState.proficiency.unlocked).toContain(skillId);
  });

  it('should ignore invalid skill IDs', () => {
    state.proficiency.skillPoints = 1;
    const skillId = 'nonExistentSkill';

    const nextState = handleGameAction(
      state,
      'UNLOCK_SKILL',
      { id: skillId },
      mockCreateJob,
      mockTriggerEvent
    );

    expect(nextState.proficiency.skillPoints).toBe(1);
    expect(nextState.proficiency.unlocked).not.toContain(skillId);
  });
});
