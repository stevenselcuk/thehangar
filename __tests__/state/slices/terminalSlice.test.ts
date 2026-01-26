import { terminalReducer, TerminalSliceState } from '@/state/slices/terminalSlice.ts';
import { AircraftType } from '@/types.ts';
import { describe, expect, it, vi } from 'vitest';

/**
 * Terminal Slice Tests
 *
 * Coverage:
 * - Archive commands: help, cls/clear, query, access
 * - Maintenance commands: help, cls/clear, search, read, scan/status
 * - Edge cases: invalid commands, missing arguments, clearance checks
 * - Resource mutations: suspicion, sanity, kardex fragments, experience
 * - Output truncation: max 100 entries
 */

describe('terminalSlice', () => {
  const createBaseState = (): TerminalSliceState => ({
    archiveTerminal: {
      output: [],
      lastCommand: '',
      securityAlertTimer: 0,
    },
    maintenanceTerminal: {
      output: [],
      lastCommand: '',
    },
    resources: {
      suspicion: 10,
      sanity: 100,
      experience: 0,
      kardexFragments: 0,
    },
    hfStats: {
      clearanceLevel: 1,
    },
    logs: [],
    activeAircraft: null,
    flags: {
      foundNote: false,
      lightsFlickered: false,
      officeUnlocked: false,
      hangarUnlocked: true,
      tarmacUnlocked: true,
      foundManifest: false,
      revealedTruth: false,
      kardexActive: false,
      suitsVisiting: false,
      underSurveillance: false,
      nightCrewActive: false,
      isHallucinating: false,
      isAfraid: false,
      toolroomMasterPissed: false,
      activeComponentFailure: false,
      fuelContaminationRisk: false,
      suspicionEvent30Triggered: false,
      suspicionEvent60Triggered: false,
      suspicionEvent90Triggered: false,
      janitorPresent: false,
      transitCheckDelegationActive: false,
      autoSrfActive: false,
      ndtFinding: null,
      venomSurgeActive: false,
      endingTriggered: null,
      endingAlienConspiracyProgress: 0,
      endingGovtConspiracyProgress: 0,
    },
  });

  describe('ARCHIVE_COMMAND', () => {
    describe('help command', () => {
      it('should display help text', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'help', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('AVAILABLE COMMANDS:');
        expect(result.archiveTerminal.output).toContain(
          '  help                  - Displays this list of commands.'
        );
        expect(result.archiveTerminal.output).toContain(
          '  dir / ls              - List files in current directory'
        );
        expect(result.archiveTerminal.output).toContain(
          '  query <employee_id>   - Retrieves a personnel file. (e.g., query HEMLOCK)'
        );
        expect(result.archiveTerminal.lastCommand).toBe('help');
      });
    });

    describe('cls/clear commands', () => {
      it('should clear output with cls', () => {
        const state = createBaseState();
        state.archiveTerminal.output = ['old output 1', 'old output 2', 'old output 3'];
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'cls', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toHaveLength(2);
        expect(result.archiveTerminal.output).toContain('> cls');
        expect(result.archiveTerminal.output).toContain('Screen cleared.');
        expect(result.archiveTerminal.lastCommand).toBe('cls');
      });

      it('should clear output with clear', () => {
        const state = createBaseState();
        state.archiveTerminal.output = ['old output'];
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'clear', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toHaveLength(2);
        expect(result.archiveTerminal.output).toContain('> clear');
        expect(result.archiveTerminal.lastCommand).toBe('clear');
      });
    });

    describe('query command', () => {
      it('should retrieve a valid employee file', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'query HEMLOCK', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('Retrieving file for: HEMLOCK, Oswald');
        expect(result.archiveTerminal.output).toContain('ID:     349-M-3M-HEM');
        expect(result.archiveTerminal.output).toContain('STATUS: [TERMINATED]');
        expect(result.resources.suspicion).toBe(12); // +2 for querying
        expect(result.archiveTerminal.lastCommand).toBe('query HEMLOCK');
      });

      it('should handle lowercase employee ID', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'query hemlock', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('Retrieving file for: HEMLOCK, Oswald');
        expect(result.resources.suspicion).toBe(12);
      });

      it('should error on invalid employee ID', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'query INVALID_ID', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain("ERR: No file found for ID 'INVALID_ID'.");
        expect(result.resources.suspicion).toBe(11); // +1 for failed query
      });

      it('should error on missing argument', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'query', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          'ERR: Missing argument. Usage: query <employee_id>'
        );
        expect(result.resources.suspicion).toBe(10); // No change
      });

      it('should query special file 9M-MRO-PILOT', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'query 9M-MRO-PILOT', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('Retrieving file for: [REDACTED]');
        expect(result.archiveTerminal.output).toContain('STATUS: [ACTIVE_MISSING]');
        expect(result.resources.suspicion).toBe(12);
      });
    });

    describe('access command', () => {
      it('should deny access when clearance is too low', () => {
        const state = createBaseState();
        state.hfStats.clearanceLevel = 1; // Low clearance
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access INCIDENT_9M-MRO', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          'ERR: ACCESS DENIED. CLEARANCE LEVEL TOO LOW.'
        );
        expect(result.archiveTerminal.output).toContain(
          'SECURITY ALERT: Unauthorized access attempt logged.'
        );
        expect(result.resources.suspicion).toBe(25); // +15 for unauthorized access
        expect(mockTriggerEvent).toHaveBeenCalledWith('audit', 'INTERNAL_SWEEP');
      });

      it('should deny access when insufficient kardex fragments', () => {
        const state = createBaseState();
        state.hfStats.clearanceLevel = 2; // Sufficient clearance
        state.resources.kardexFragments = 0; // But no fragments
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access INCIDENT_9M-MRO', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          'ERR: INSUFFICIENT RESOURCES. REQUIRES 1 K-FRAG(s).'
        );
        expect(result.resources.suspicion).toBe(15); // +5
        expect(result.resources.kardexFragments).toBe(0); // Not deducted
        expect(mockTriggerEvent).not.toHaveBeenCalled();
      });

      it('should grant access when clearance and resources are sufficient', () => {
        const state = createBaseState();
        state.hfStats.clearanceLevel = 2;
        state.resources.kardexFragments = 1;
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access INCIDENT_9M-MRO', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('ACCESSING: INCIDENT REPORT: 9M-MRO');
        expect(result.archiveTerminal.output).toContain(
          'FLIGHT DATA RECORDER -- PARTIAL RECOVERY:'
        );
        expect(result.archiveTerminal.output).toContain('END OF FILE.');
        expect(result.resources.kardexFragments).toBe(0); // Cost deducted
        expect(result.resources.suspicion).toBe(20); // +10 for accessing
        expect(result.resources.sanity).toBe(85); // -15 for reading
        expect(result.logs.length).toBeGreaterThan(0); // Log added
      });

      it('should grant access to high-cost archive PROJECT_KARDEX', () => {
        const state = createBaseState();
        state.hfStats.clearanceLevel = 3;
        state.resources.kardexFragments = 3;
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access PROJECT_KARDEX', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain('ACCESSING: PROJECT: KARDEX - OVERVIEW');
        expect(result.resources.kardexFragments).toBe(0); // 3 fragments deducted
        expect(result.resources.suspicion).toBe(20);
        expect(result.resources.sanity).toBe(85);
      });

      it('should error on invalid archive ID', () => {
        const state = createBaseState();
        state.hfStats.clearanceLevel = 5;
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access INVALID_ARCHIVE', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          "ERR: No archive found for ID 'INVALID_ARCHIVE'."
        );
        expect(result.resources.suspicion).toBe(12); // +2
      });

      it('should error on missing argument', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'access', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          'ERR: Missing argument. Usage: access <archive_id>'
        );
        expect(result.resources.suspicion).toBe(10);
      });
    });

    describe('invalid commands', () => {
      it('should error on unknown command', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'invalid_command', triggerEvent: mockTriggerEvent },
        });

        expect(result.archiveTerminal.output).toContain(
          "ERR: Command not found: 'invalid_command'. Type 'help' for a list of commands."
        );
      });

      it('should not error on empty command', () => {
        const state = createBaseState();
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: '', triggerEvent: mockTriggerEvent },
        });

        // Empty command should not produce an error, just echo the prompt
        expect(result.archiveTerminal.output).toContain('> ');
      });
    });

    describe('output truncation', () => {
      it('should truncate output to max 100 entries', () => {
        const state = createBaseState();
        // Fill with 98 entries
        state.archiveTerminal.output = Array(98).fill('old output');
        const mockTriggerEvent = vi.fn();

        const result = terminalReducer(state, {
          type: 'ARCHIVE_COMMAND',
          payload: { command: 'help', triggerEvent: mockTriggerEvent },
        });

        // Help adds ~10 lines, total would be 108, should truncate to 100
        expect(result.archiveTerminal.output.length).toBe(100);
      });
    });
  });

  describe('MAINTENANCE_COMMAND', () => {
    describe('help command', () => {
      it('should display help text', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'help' },
        });

        expect(result.maintenanceTerminal.output).toContain('AVAILABLE COMMANDS:');
        expect(result.maintenanceTerminal.output).toContain(
          '  search <part_no|ac_reg> - Searches for an item in the database.'
        );
        expect(result.maintenanceTerminal.lastCommand).toBe('help');
      });
    });

    describe('cls/clear commands', () => {
      it('should clear output with cls', () => {
        const state = createBaseState();
        state.maintenanceTerminal.output = ['old output 1', 'old output 2'];

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'cls' },
        });

        expect(result.maintenanceTerminal.output).toHaveLength(2);
        expect(result.maintenanceTerminal.output).toContain('> cls');
        expect(result.maintenanceTerminal.output).toContain('Screen cleared.');
      });

      it('should clear output with clear', () => {
        const state = createBaseState();
        state.maintenanceTerminal.output = ['old output'];

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'clear' },
        });

        expect(result.maintenanceTerminal.output).toHaveLength(2);
        expect(result.maintenanceTerminal.lastCommand).toBe('clear');
      });
    });

    describe('search command', () => {
      it('should find a valid part', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'search BMS-5-95' },
        });

        expect(result.maintenanceTerminal.output).toContain('DATABASE HIT FOR: BMS-5-95');
        expect(result.maintenanceTerminal.output).toContain(
          'DESCRIPTION: Standard fuselage sealant.'
        );
        expect(result.resources.experience).toBe(50); // +50 for successful search
      });

      it('should handle lowercase part number', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'search bms-5-95' },
        });

        expect(result.maintenanceTerminal.output).toContain('DATABASE HIT FOR: BMS-5-95');
        expect(result.resources.experience).toBe(50);
      });

      it('should search for special part 9M-MRO', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'search 9M-MRO' },
        });

        expect(result.maintenanceTerminal.output).toContain('DATABASE HIT FOR: 9M-MRO');
        expect(result.maintenanceTerminal.output).toContain(
          'DESCRIPTION: B777-200ER, Last known registration.'
        );
        expect(result.resources.experience).toBe(50);
      });

      it('should give minimal XP for invalid part', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'search INVALID_PART' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          "NO DATABASE ENTRY FOUND FOR 'INVALID_PART'."
        );
        expect(result.resources.experience).toBe(10); // +10 for effort
      });

      it('should error on missing argument', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'search' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          'ERR: Missing argument. Usage: search <id>'
        );
        expect(result.resources.experience).toBe(0);
      });
    });

    describe('read command', () => {
      it('should read a valid maintenance log', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'read LOG-481516' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          'READING LOG: B777-200ER - C-Check Anomaly Report'
        );
        expect(result.maintenanceTerminal.output).toContain('Entry by: O. Hemlock');
        expect(result.maintenanceTerminal.output).toContain('END OF LOG.');
        expect(result.resources.experience).toBe(150); // +150 for reading log
        expect(result.resources.sanity).toBe(95); // -5 for disturbing content
      });

      it('should handle lowercase log ID', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'read log-2342' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          'READING LOG: A300F - Cargo Incident #2342'
        );
        expect(result.resources.experience).toBe(150);
        expect(result.resources.sanity).toBe(95);
      });

      it('should error on invalid log ID', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'read INVALID_LOG' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          "ERR: Log ID 'INVALID_LOG' not found in archive."
        );
        expect(result.resources.experience).toBe(0);
        expect(result.resources.sanity).toBe(100);
      });

      it('should error on missing argument', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'read' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          'ERR: Missing argument. Usage: read <log_id>'
        );
      });
    });

    describe('scan/status commands', () => {
      it('should detect active aircraft', () => {
        const state = createBaseState();
        state.activeAircraft = {
          id: AircraftType.B737_700,
          task: 'TRANSIT_CHECK',
        };

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'scan' },
        });

        expect(result.maintenanceTerminal.output).toContain('Scanning local network...');
        expect(result.maintenanceTerminal.output).toContain(
          '... ACTIVE AIRCRAFT DETECTED: Boeing 737-700 (Special Variant)'
        );
        expect(result.maintenanceTerminal.output).toContain('... ASSIGNED TASK: TRANSIT CHECK');
      });

      it('should use status alias', () => {
        const state = createBaseState();
        state.activeAircraft = {
          id: AircraftType.A330,
          task: 'ETOPS_CHECK',
        };

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'status' },
        });

        expect(result.maintenanceTerminal.output).toContain('Scanning local network...');
        expect(result.maintenanceTerminal.output).toContain(
          '... ACTIVE AIRCRAFT DETECTED: Airbus A330'
        );
        expect(result.maintenanceTerminal.output).toContain('... ASSIGNED TASK: ETOPS CHECK');
      });

      it('should detect suspicious aircraft', () => {
        const state = createBaseState();
        state.activeAircraft = {
          id: AircraftType.B737_700, // This aircraft is marked as suspicious
          task: 'DAILY_CHECK',
        };

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'scan' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          '... WARNING: Non-standard transponder signature detected.'
        );
      });

      it('should report no aircraft when inactive', () => {
        const state = createBaseState();
        state.activeAircraft = null;

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'scan' },
        });

        expect(result.maintenanceTerminal.output).toContain('Scanning local network...');
        expect(result.maintenanceTerminal.output).toContain(
          '... No active aircraft assigned to this terminal.'
        );
      });
    });

    describe('invalid commands', () => {
      it('should error on unknown command', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'invalid_command' },
        });

        expect(result.maintenanceTerminal.output).toContain(
          "ERR: Command not found: 'invalid_command'."
        );
      });

      it('should not error on empty command', () => {
        const state = createBaseState();

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: '' },
        });

        expect(result.maintenanceTerminal.output).toContain('> ');
      });
    });

    describe('output truncation', () => {
      it('should truncate output to max 100 entries', () => {
        const state = createBaseState();
        // Fill with 98 entries
        state.maintenanceTerminal.output = Array(98).fill('old output');

        const result = terminalReducer(state, {
          type: 'MAINTENANCE_COMMAND',
          payload: { command: 'help' },
        });

        // Help adds ~10 lines, total would be 108, should truncate to 100
        expect(result.maintenanceTerminal.output.length).toBe(100);
      });
    });
  });

  describe('immutability', () => {
    it('should not mutate original state for archive commands', () => {
      const state = createBaseState();
      const originalOutput = [...state.archiveTerminal.output];
      const originalSuspicion = state.resources.suspicion;
      const mockTriggerEvent = vi.fn();

      terminalReducer(state, {
        type: 'ARCHIVE_COMMAND',
        payload: { command: 'help', triggerEvent: mockTriggerEvent },
      });

      expect(state.archiveTerminal.output).toEqual(originalOutput);
      expect(state.resources.suspicion).toBe(originalSuspicion);
    });

    it('should not mutate original state for maintenance commands', () => {
      const state = createBaseState();
      const originalOutput = [...state.maintenanceTerminal.output];
      const originalExperience = state.resources.experience;

      terminalReducer(state, {
        type: 'MAINTENANCE_COMMAND',
        payload: { command: 'help' },
      });

      expect(state.maintenanceTerminal.output).toEqual(originalOutput);
      expect(state.resources.experience).toBe(originalExperience);
    });
  });
});
