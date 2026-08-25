import { describe, it } from 'vitest';
import { proficiencyReducer, type ProficiencySliceState } from '@/state/slices/proficiencySlice.ts';
import { createMinimalGameState } from '@/utils/testHelpers.ts';

describe('Performance Benchmark: UNLOCK_SKILL', () => {
  it('benchmarks UNLOCK_SKILL array spread', () => {
    const fullState = createMinimalGameState();
    const state: ProficiencySliceState = {
      proficiency: { ...fullState.proficiency, skillPoints: 10 },
      resources: {
        credits: fullState.resources.credits,
        experience: fullState.resources.experience,
        level: fullState.resources.level,
      },
      inventory: fullState.inventory,
      hfStats: { hfRecurrentDueDate: fullState.hfStats.hfRecurrentDueDate },
      logs: fullState.logs,
    };

    // Use a skill that exists in skillsData.mechanic
    const skillId = 'scrapSavant';

    const iterations = 50000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      // We use a state that has skillPoints but the skill is NOT unlocked
      // Since proficiencyReducer returns a new state each call but we don't
      // reassign `state` here, we are effectively testing the same path every
      // time (lookup -> check unlocked -> add). The bottleneck is the finding
      // of the skill.
      proficiencyReducer(state, { type: 'UNLOCK_SKILL', payload: { id: skillId } });
    }

    const end = performance.now();
    console.log(
      `UNLOCK_SKILL execution time for ${iterations} iterations: ${(end - start).toFixed(4)}ms`
    );
  });
});
