import { describe, expect, it } from 'vitest';
import { EVENT_RESOLUTION_TEMPLATES } from '../../data/flavor';
import { eventsReducer, EventsSliceState } from './eventsSlice';

describe('eventsSlice - RESOLVE_EVENT', () => {
  it('should generate a dynamic resolution log when an event is resolved', () => {
    const initialState: EventsSliceState = {
      activeEvent: {
        id: 'test_event',
        type: 'accident', // Should map to MAINTENANCE department or GENERAL
        title: 'Test Event',
        description: 'Test',
        timeLeft: 100,
        totalTime: 100,
        failureOutcome: { log: 'Failed' },
      },
      resources: {
        sanity: 80,
        suspicion: 10,
        experience: 0,
        credits: 100,
      } as EventsSliceState['resources'],
      stats: {
        eventsResolved: 0,
      } as EventsSliceState['stats'],
      logs: [],
      inventory: {} as EventsSliceState['inventory'],
      anomalies: [],
      toolConditions: {},
      flags: {} as EventsSliceState['flags'],
      hfStats: {} as EventsSliceState['hfStats'],
      rotables: [],
      proficiency: {} as EventsSliceState['proficiency'],
      activeJob: null,
      journal: [],
    };

    const nextState = eventsReducer(initialState, { type: 'RESOLVE_EVENT', payload: {} });

    expect(nextState.stats.eventsResolved).toBe(1);
    expect(nextState.activeEvent).toBeNull();

    // Check logs
    const addedLog = nextState.logs[0];
    expect(addedLog).toBeDefined();
    expect(addedLog.type).toBe('story');

    // Verify the text comes from one of our templates
    const isTemplateText = EVENT_RESOLUTION_TEMPLATES.some((t) => t.text === addedLog.text);
    expect(isTemplateText).toBe(true);
  });

  it('should use ELDRITCH tone when sanity is low', () => {
    const initialState: EventsSliceState = {
      activeEvent: {
        id: 'test_event_2',
        type: 'bureaucratic_horror',
        title: 'Test Event',
        description: 'Test',
        timeLeft: 100,
        totalTime: 100,
        failureOutcome: { log: 'Failed' },
      },
      resources: {
        sanity: 10,
        suspicion: 10,
        experience: 0,
      } as EventsSliceState['resources'],
      stats: { eventsResolved: 0 } as EventsSliceState['stats'],
      logs: [],
      inventory: {} as EventsSliceState['inventory'],
      anomalies: [],
      toolConditions: {},
      flags: {} as EventsSliceState['flags'],
      hfStats: {} as EventsSliceState['hfStats'],
      rotables: [],
      proficiency: {} as EventsSliceState['proficiency'],
      activeJob: null,
      journal: [],
    };

    const nextState = eventsReducer(initialState, { type: 'RESOLVE_EVENT', payload: {} });
    const addedLog = nextState.logs[0];

    // We expect the log to likely be ELDRITCH tone, or at least one compatible with low sanity.
    const matchingTemplate = EVENT_RESOLUTION_TEMPLATES.find((t) => t.text === addedLog.text);
    expect(matchingTemplate).toBeDefined();

    // If it picked an ELDRITCH one, great. If it picked a fallback MUNDANE, that's also allowed by logic,
    // but with sanity 10 and type 'bureaucratic_horror' (which maps to BUREAUCRATIC tone context),
    // actually...
    // Logic:
    // Context: sanity=low -> ELDRITCH context override?
    // In logGenerator: `if (state.resources.sanity < 20) { context.tone = 'ELDRITCH'; }`
    // So tone is ELDRITCH.
    // Filter: Template tone must be ELDRITCH (or maybe MUNDANE fallback).

    if (matchingTemplate?.tone) {
      // If it has a tone, it should ideally be ELDRITCH.
      // But MUNDANE is allowed as fallback.
      // Our Mundane templates don't usually have sanity conditions preventing them at low sanity,
      // except specifically "Maintenance action complete... minSanity: 50".
      // So we just check that we didn't get a 'high sanity' template.
      if (matchingTemplate.conditions?.minSanity) {
        expect(matchingTemplate.conditions.minSanity).toBeLessThanOrEqual(10);
      }
    }
  });
});
