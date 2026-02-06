import { describe, it, vi } from 'vitest';
import { handleGameAction } from '../../src/logic/actionProcessor';
import { createInitialState } from '../../src/state/initialState';

describe('Performance Benchmark: UNLOCK_SKILL', () => {
    it('benchmarks UNLOCK_SKILL array spread', () => {
        const state = createInitialState();
        state.proficiency.skillPoints = 10;

        // Mock dependencies
        const mockCreateJob = vi.fn();
        const mockTriggerEvent = vi.fn();

        // Use a skill that exists in skillsData.mechanic
        const skillId = 'scrapSavant';

        const iterations = 50000;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            // We use a state that has skillPoints but the skill is NOT unlocked
            // Since handleGameAction creates a new state but we don't update `state` variable here,
            // we are effectively testing the same path every time (lookup -> check unlocked -> add)
            // However, handleGameAction returns a new state.
            // The bottleneck is the finding of the skill.
            handleGameAction(
                state,
                'UNLOCK_SKILL',
                { id: skillId },
                mockCreateJob,
                mockTriggerEvent
            );
        }

        const end = performance.now();
        console.log(`UNLOCK_SKILL execution time for ${iterations} iterations: ${(end - start).toFixed(4)}ms`);
    });
});
