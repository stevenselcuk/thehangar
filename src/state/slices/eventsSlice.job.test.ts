import { describe, expect, it } from 'vitest';
import { eventsReducer, EventsSliceState } from './eventsSlice';

describe('eventsSlice - Job Flow', () => {
  const getInitialState = (): EventsSliceState => ({
    activeJob: null,
    activeEvent: null,
    stats: { jobsCompleted: 0, eventsResolved: 0 } as unknown as EventsSliceState['stats'],
    resources: {
      credits: 0,
      experience: 0,
      technicalLogbookHours: 0,
      sanity: 100,
      focus: 100,
      alclad: 1000,
      rivets: 1000,
      titanium: 1000,
      crystallineResonators: 0,
      bioFilament: 0,
      skydrol: 0,
    } as unknown as EventsSliceState['resources'],
    anomalies: [],
    toolConditions: {
      snapOnWrenchSet: 100,
      rivetGun: 100,
      atlasCopcoDrill: 100,
      malabar: 100,
      greaseGun: 100,
      inspectionMirror: 100,
      torquemeter: 100,
      idg: 100,
    },
    inventory: {
      snapOnWrenchSet: true,
      rivetGun: true,
      atlasCopcoDrill: true,
      malabar: true,
      greaseGun: true,
      inspectionMirror: true,
      torquemeter: true,
      idg: true,
    } as unknown as EventsSliceState['inventory'],
    flags: {} as unknown as EventsSliceState['flags'],
    hfStats: {} as unknown as EventsSliceState['hfStats'],
    logs: [],
    journal: [],
    rotables: [],
    proficiency: {
      unlocked: ['highTorqueMethods'],
    } as unknown as EventsSliceState['proficiency'],
  });

  it('should start a standard job when START_STANDARD_JOB is dispatched', () => {
    const initialState = getInitialState();
    const nextState = eventsReducer(initialState, { type: 'START_STANDARD_JOB', payload: {} });

    expect(nextState.activeJob).not.toBeNull();
    expect(nextState.activeJob?.id).toBeDefined();
    expect(nextState.activeJob?.timeLeft).toBeGreaterThan(0);
    expect(nextState.logs.length).toBeGreaterThan(0);
    expect(nextState.logs[0].text).toContain('Work Order');
  });

  it('should not overwrite an active job', () => {
    const initialState = getInitialState();
    // Start a job
    const stateWithJob = eventsReducer(initialState, { type: 'START_STANDARD_JOB', payload: {} });
    const jobId = stateWithJob.activeJob?.id;

    // Try to start another
    const nextState = eventsReducer(stateWithJob, { type: 'START_STANDARD_JOB', payload: {} });

    expect(nextState.activeJob?.id).toBe(jobId);
    expect(nextState.logs[0].text).toContain('Existing work order still active');
  });

  it('should complete a job and clear activeJob', () => {
    const initialState = getInitialState();
    // Start a job
    const stateWithJob = eventsReducer(initialState, { type: 'START_STANDARD_JOB', payload: {} });
    expect(stateWithJob.activeJob).not.toBeNull();

    // Complete it
    const nextState = eventsReducer(stateWithJob, { type: 'COMPLETE_JOB', payload: {} });

    expect(nextState.activeJob).toBeNull();
    expect(nextState.stats.jobsCompleted).toBe(1);
    expect(nextState.resources.experience).toBeGreaterThan(0);
  });

  it('should consume resources when completing a job', () => {
    const initialState = getInitialState();
    // Mock a job with requirements
    const stateWithJob: EventsSliceState = {
      ...initialState,
      activeJob: {
        id: 'test_job',
        title: 'Test Job',
        description: 'Test',
        timeLeft: 100,
        totalTime: 100,
        rewardXP: 100,
        requirements: { alclad: 10, tools: [] },
      },
      resources: { ...initialState.resources, alclad: 50 },
    };

    const nextState = eventsReducer(stateWithJob, { type: 'COMPLETE_JOB', payload: {} });

    expect(nextState.activeJob).toBeNull();
    expect(nextState.resources.alclad).toBe(40); // 50 - 10
  });

  it('should fail to complete job if resources are insufficient', () => {
    const initialState = getInitialState();
    const stateWithJob: EventsSliceState = {
      ...initialState,
      activeJob: {
        id: 'test_job',
        title: 'Test Job',
        description: 'Test',
        timeLeft: 100,
        totalTime: 100,
        rewardXP: 100,
        requirements: { alclad: 60, tools: [] },
      },
      resources: { ...initialState.resources, alclad: 50 },
      logs: [],
    };

    const nextState = eventsReducer(stateWithJob, { type: 'COMPLETE_JOB', payload: {} });

    expect(nextState.activeJob).not.toBeNull(); // Should not complete
    expect(nextState.resources.alclad).toBe(50); // Should not consume
    expect(nextState.logs[0].text).toContain('Insufficient');
  });
});
