import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { terminalLocationReducer, TerminalLocationSliceState } from '../terminalLocationSlice';

// Mock flavor data
vi.mock('../../../data/flavor.ts', () => ({
  ACTION_LOGS: {
    WATCH_BOARDS_1: 'WB1',
    WATCH_BOARDS_2: 'WB2',
    WATCH_BOARDS_3: 'WB3',
    GO_RESTROOM_SUIT: 'GRS',
    TERMINAL_RESTROOM_2: 'TR2',
    TERMINAL_RESTROOM_1: 'TR1',
    EAT_BURGER: 'EB',
    SLEEP_GATE_1: 'SG1',
    SLEEP_GATE_3: 'SG3',
    SLEEP_GATE_2: 'SG2',
    OFFER_ASSISTANCE_CAUGHT: 'OAC',
    OFFER_ASSISTANCE_WEIRD: 'OAW',
    OFFER_ASSISTANCE_CLUE: 'OACLUE',
    OFFER_ASSISTANCE_SUSPICIOUS: 'OAS',
    OFFER_ASSISTANCE_NORMAL: 'OAN',
    RUMMAGE_LOST_FOUND_CREDITS: 'RLFC',
    RUMMAGE_LOST_FOUND_SANITY: 'RLFS',
    RUMMAGE_LOST_FOUND_WEIRD: 'RLFW',
    CHECK_DELAYED_GATE_COLD: 'CDGC',
    CHECK_DELAYED_GATE_SOUND: 'CDGS',
    CHECK_DELAYED_GATE_NORMAL: 'CDGN',
    INSPECT_VENDING_MACHINE_COIN: 'IVMC',
    INSPECT_VENDING_MACHINE_NOTE: 'IVMN',
    INSPECT_VENDING_MACHINE_NOTHING: 'IVMNO',
  },
  RUMMAGE_FLAVOR_TEXTS: ['RLF1', 'RLF2'],
  PAYPHONE_FLAVOR_TEXTS: ['PPT'],
  REGULAR_TALK_LOGS: { CLUES: ['C1'], WARNINGS: ['W1'], RAMBLES: ['R1'] },
  SMALL_TALK_PERSONNEL_LOGS: ['STP1'],
}));

describe('terminalLocationReducer', () => {
  let initialState: TerminalLocationSliceState;
  const mockTriggerEvent = vi.fn();
  const ID_ROLL = 0.5; // Placeholder for log ID generation

  beforeEach(() => {
    vi.clearAllMocks();
    initialState = {
      resources: {
        credits: 100,
        sanity: 50,
        focus: 50,
        suspicion: 10,
        experience: 0,
        technicalLogbookHours: 0,
      },
      flags: {
        isAfraid: false,
        janitorPresent: false,
        onPerformanceImprovementPlan: false,
        activeComponentFailure: null,
      },
      hfStats: {
        fearTimer: 0,
        socialStress: 0,
        accessTunnelFound: false,
      },
      proficiency: { unlocked: [] },
      logs: [],
    } as unknown as TerminalLocationSliceState;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('WATCH_BOARDS', () => {
    it('should trigger vibration log (<0.1) and suit sighting (<0.05)', () => {
      // 1. watchRoll < 0.1
      // 2. addLog ID
      // 3. eventRoll < 0.05
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.05)
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.01);

      const action = {
        type: 'WATCH_BOARDS',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('WB2');
      expect(newState.logs[0].type).toBe('vibration');
      expect(newState.resources.suspicion).toBe(15);
      expect(mockTriggerEvent).toHaveBeenCalledWith('incident', 'SUIT_SIGHTING_TERMINAL');
    });

    it('should trigger story log (<0.2) and no event', () => {
      // 1. watchRoll 0.15 (<0.2)
      // 2. addLog ID
      // 3. eventRoll 0.1 (>0.05) - wait, this is checked OUTSIDE the if/else if/else blocks?
      // Yes, verify code structure:
      // if (watchRoll < 0.1) ... else if ... else ...
      // if (Math.random() < 0.05 ...) ...
      // So Call 3 happens regardless of branch.
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.15)
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.1);

      const action = { type: 'WATCH_BOARDS' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('WB3');
      expect(newState.logs[0].type).toBe('story');
    });

    it('should trigger info log (>=0.2)', () => {
      // 1. watchRoll 0.5
      // 2. addLog ID
      // 3. eventRoll 0.1
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.1);

      const action = { type: 'WATCH_BOARDS' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('WB1');
    });
  });

  describe('GO_TERMINAL_RESTROOM', () => {
    it('should trigger suit encounter (<0.1)', () => {
      // 1. restroomRoll < 0.1
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.05).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'GO_TERMINAL_RESTROOM' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('GRS');
      expect(newState.flags.isAfraid).toBe(true);
    });

    it('should trigger vibration (<0.3)', () => {
      // 1. restroomRoll 0.2
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.2).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'GO_TERMINAL_RESTROOM' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('TR2');
    });

    it('should trigger info (else)', () => {
      // 1. restroomRoll 0.5
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'GO_TERMINAL_RESTROOM' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('TR1');
    });
  });

  describe('EAT_TERMINAL_BURGER', () => {
    it('should eat burger if enough credits', () => {
      initialState.resources.credits = 15;
      // 1. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(ID_ROLL);

      const action = { type: 'EAT_TERMINAL_BURGER' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('EB');
    });

    it('should fail if not enough credits', () => {
      initialState.resources.credits = 10;
      // 1. addLog ID (error log)
      vi.spyOn(Math, 'random').mockReturnValueOnce(ID_ROLL);

      const action = { type: 'EAT_TERMINAL_BURGER' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].type).toBe('error');
    });
  });

  describe('SLEEP_AT_GATE', () => {
    it('should reset stats and trigger security wakeup', () => {
      // 1. addLog ID (SG1)
      // 2. Random < 0.33
      // 3. Incident Roll < 0.5
      // 4. addLog ID (SG3)
      // 5. Dream Journal logic (uses hasSkill) -> assumes it calls hasSkill first?
      // Code: if (hasSkill(...) && Math.random() < 0.35)
      // Check code order:
      // 1. addLog(SG1)
      // 2. Logic block for incident
      // 3. Logic block for Dream Journal
      // So 5. Dream Journal roll (if skill matches) or skip?
      // hasSkill returns false by default in this test (proficiency empty).
      // So Dream Journal roll is NOT called if no skill.

      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.1) // < 0.33
        .mockReturnValueOnce(0.2) // < 0.5 (Security Wakeup)
        .mockReturnValueOnce(ID_ROLL); // log ID

      const action = {
        type: 'SLEEP_AT_GATE',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      terminalLocationReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('incident', 'SECURITY_WAKEUP');
    });

    it('should trigger audit', () => {
      // 1. addLog ID (SG1)
      // 2. Random < 0.33
      // 3. Incident Roll >= 0.5
      // 4. addLog ID (Suit figure)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.1) // < 0.33
        .mockReturnValueOnce(0.6) // >= 0.5 (Audit)
        .mockReturnValueOnce(ID_ROLL);

      const action = {
        type: 'SLEEP_AT_GATE',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      terminalLocationReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('audit', 'AUDIT_INTERNAL');
    });

    it('should trigger dream journal bonus if skilled', () => {
      initialState.proficiency.unlocked = ['dreamJournal'];
      // 1. addLog ID (SG1)
      // 2. Random >= 0.33 (skip incident)
      // 3. Dream Journal < 0.35
      // 4. addLog ID (SG2)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.5) // >= 0.33
        .mockReturnValueOnce(0.2) // < 0.35
        .mockReturnValueOnce(ID_ROLL);

      const action = { type: 'SLEEP_AT_GATE' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('SG2');
      expect(newState.resources.experience).toBe(600);
    });
  });

  describe('SMALL_TALK_PERSONNEL', () => {
    it('should trigger EASA audit (<0.05)', () => {
      // 1. Log Select (Math.floor)
      // 2. addLog ID
      // 3. Event roll < 0.05
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.01);

      const action = {
        type: 'SMALL_TALK_PERSONNEL',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      terminalLocationReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('audit', 'EASA_AUDIT_SURPRISE');
    });
  });

  describe('OFFER_ASSISTANCE', () => {
    it('should trigger caught (<0.1)', () => {
      // 1. assistRoll < 0.1
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.05).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'OFFER_ASSISTANCE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('OAC');
    });

    it('should trigger weird (<0.4)', () => {
      // 1. assistRoll 0.3
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.3).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'OFFER_ASSISTANCE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('OAW');
    });
  });

  describe('USE_PAYPHONE', () => {
    it('should fail if no credits', () => {
      initialState.resources.credits = 0;
      // 1. addLog ID (warning)
      vi.spyOn(Math, 'random').mockReturnValueOnce(ID_ROLL);

      const action = { type: 'USE_PAYPHONE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].type).toBe('warning');
    });

    it('should trigger EASA audit', () => {
      // 1. Flavor text select
      // 2. Spooky roll
      // 3. addLog ID
      // 4. Event roll < 0.1
      // 5. Audit type < 0.5
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(ID_ROLL)
        .mockReturnValueOnce(0.05)
        .mockReturnValueOnce(0.2);

      const action = {
        type: 'USE_PAYPHONE',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      terminalLocationReducer(initialState, action);

      expect(mockTriggerEvent).toHaveBeenCalledWith('audit', 'PAYPHONE_EASA_AUDIT');
    });
  });

  describe('TALK_TO_REGULAR', () => {
    it('should trigger clue (<0.3)', () => {
      // 1. roll < 0.3
      // 2. clue select
      // 3. addLog ID
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(ID_ROLL);

      const action = { type: 'TALK_TO_REGULAR' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('C1');
    });
  });

  describe('RUMMAGE_LOST_FOUND', () => {
    it('should find credits (<0.2 inside the 70% flavor block)', () => {
      // Logic:
      // 1. Photo Event Roll (must be >= 0.3 to skip photo event) -> 0.4
      // 2. Flavor Text (random index) -> 0 (index)
      // 3. Credits/XP Roll (implicit in code, just adds credits)
      // Wait, looking at the code:
      // else {
      //    addLog(flavor);
      //    credits += floor(random * 10);
      //    xp += 50;
      // }
      // There is no extra probability roll inside the "else" block in the NEW code.
      // It just adds credits.

      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.4) // 1. >= 0.3 (Skip Photo Event)
        .mockReturnValueOnce(0) // 2. Flavor text index
        .mockReturnValueOnce(0.1) // 3. addLog ID generation
        .mockReturnValueOnce(0.5); // 4. Credits: floor(0.5 * 10) = 5

      const action = { type: 'RUMMAGE_LOST_FOUND' } as const;
      const newState = terminalLocationReducer(initialState, action);

      expect(newState.logs[0].text).toBe('RLF1');
      expect(newState.resources.credits).toBe(105); // 100 + 5
    });

    it('should trigger photo event (<0.3)', () => {
      // 1. Photo Event Roll < 0.3 -> 0.1
      // 2. Weighted Selection (mocked photoEvents? No, we need to mock import)
      // The test imports the real reducer which imports the real photoEvents.
      // We might need to mock photoEvents.ts if we want deterministic results,
      // OR just rely on the fact that there's at least one event.

      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // < 0.3 (Trigger Photo Event)
        .mockReturnValueOnce(0.5); // Weight roll

      const action = {
        type: 'RUMMAGE_LOST_FOUND',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;

      // We need to ensure photoEvents has entries.
      // Since we are not mocking photoEvents.ts, it uses the real file.
      // Real file has 10 events.

      const newState = terminalLocationReducer(initialState, action);

      // It should call triggerEvent with 'story_event' and some ID
      expect(mockTriggerEvent).toHaveBeenCalledWith('story_event', expect.any(String));
      expect(newState.logs[0].type).toBe('story');
    });
  });

  describe('CHECK_DELAYED_GATE', () => {
    it('should warn if low sanity', () => {
      initialState.resources.sanity = 20;
      // 1. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(ID_ROLL);

      const action = { type: 'CHECK_DELAYED_GATE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toContain("can't bring yourself");
    });

    it('should trigger cold (<0.2)', () => {
      // 1. roll < 0.2
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'CHECK_DELAYED_GATE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('CDGC');
      expect(newState.flags.isAfraid).toBe(true);
    });

    it('should trigger sound (<0.5)', () => {
      // 1. roll < 0.5 (but >= 0.2)
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.3).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'CHECK_DELAYED_GATE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('CDGS');
      expect(newState.resources.experience).toBe(200);
    });
  });

  describe('INSPECT_VENDING_MACHINE', () => {
    it('should trigger syndicate event (<0.35)', () => {
      // 1. roll < 0.35
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.3).mockReturnValueOnce(ID_ROLL);

      const action = {
        type: 'INSPECT_VENDING_MACHINE',
        payload: { triggerEvent: mockTriggerEvent },
      } as const;
      terminalLocationReducer(initialState, action);
      expect(mockTriggerEvent).toHaveBeenCalledWith('syndicate');
    });

    it('should find note (<0.6)', () => {
      // 1. roll < 0.6 (but >= 0.35)
      // 2. addLog ID
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.4).mockReturnValueOnce(ID_ROLL);

      const action = { type: 'INSPECT_VENDING_MACHINE' } as const;
      const newState = terminalLocationReducer(initialState, action);
      expect(newState.logs[0].text).toBe('IVMN');
    });
  });
});
