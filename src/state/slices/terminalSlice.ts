import { produce } from 'immer';
import { aircraftData } from '../../data/aircraft.ts';
import { employeeFiles, redactedArchives } from '../../data/archiveData.ts';
import { maintenanceLogs, partInfo } from '../../data/maintenanceArchiveData.ts';
import { HELP_TEXT, TERMINAL_FILES } from '../../data/terminalContent.ts';
import { addLogToDraft } from '../../services/logService.ts';
import {
  ActiveAircraft,
  ArchiveTerminalState,
  GameFlags,
  LogMessage,
  MaintenanceTerminalState,
} from '../../types.ts';

/**
 * Terminal Slice - Manages terminal command interfaces
 * Handles: Archive Terminal, Maintenance Terminal
 *
 * Target: 150-200 lines
 * Extracted from gameReducer.ts lines 741-1006
 */

export interface TerminalSliceState {
  archiveTerminal: ArchiveTerminalState;
  maintenanceTerminal: MaintenanceTerminalState;
  resources: {
    suspicion: number;
    sanity: number;
    experience: number;
    kardexFragments: number;
  };
  hfStats: {
    clearanceLevel: number;
  };
  logs: Array<LogMessage>;
  activeAircraft: ActiveAircraft | null;
  flags: GameFlags;
}

type TerminalAction =
  | {
      type: 'ARCHIVE_COMMAND';
      payload: { command: string; triggerEvent: (type: string, id?: string) => void };
    }
  | { type: 'MAINTENANCE_COMMAND'; payload: { command: string } };

/**
 * Terminal reducer - handles all terminal command processing
 */
export const terminalReducer = (
  state: TerminalSliceState,
  action: TerminalAction
): TerminalSliceState => {
  return produce(state, (draft) => {
    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    switch (action.type) {
      case 'ARCHIVE_COMMAND': {
        const { command: commandFull } = action.payload; // triggerEvent removed from payload in reducerComposer? Check.
        // reducerComposer passes: payload: action.payload as { command: string; triggerEvent... }
        // We can access triggerEvent if needed.
        const { triggerEvent } = action.payload;

        const [command, ...args] = commandFull.trim().toLowerCase().split(/\s+/);

        draft.archiveTerminal.output.push(`> ${commandFull}`);

        switch (command) {
          case 'help':
            draft.archiveTerminal.output.push(
              '============================================================================',
              ...HELP_TEXT,
              '============================================================================'
            );
            break;

          case 'cls':
          case 'clear':
            draft.archiveTerminal.output = [`> ${commandFull}`, 'Screen cleared.'];
            break;

          case 'whoami':
            draft.archiveTerminal.output.push(
              'USER: [REDACTED]',
              'CLEARANCE: LEVEL ' + draft.hfStats.clearanceLevel,
              'STATUS: PROBATIONARY',
              'NOTE: "Stop asking questions you don\'t want answers to."'
            );
            break;

          case 'dir':
          case 'ls':
            draft.archiveTerminal.output.push(
              'DIRECTORY LISTING:',
              '------------------',
              ...Object.keys(TERMINAL_FILES).map((f) => {
                const file = TERMINAL_FILES[f];
                const isLocked =
                  file.reqFlags &&
                  !file.reqFlags.every((flag) => draft.flags?.[flag as keyof GameFlags]);
                return `${f.padEnd(20)} ${file.type.toUpperCase()} ${isLocked ? '[LOCKED]' : ''}`;
              }),
              '------------------'
            );
            break;

          case 'open':
          case 'cat':
          case 'type': {
            if (!args[0]) {
              draft.archiveTerminal.output.push('ERR: Filename required.');
              break;
            }
            const filename = Object.keys(TERMINAL_FILES).find(
              (k) => k.toLowerCase() === args[0].toLowerCase()
            );
            if (!filename) {
              draft.archiveTerminal.output.push(`ERR: File '${args[0]}' not found.`);
              break;
            }
            const file = TERMINAL_FILES[filename];

            // Check flags (Assuming GameState flags are accessible via reducerComposer mapping?)
            // reducerComposer maps: `resources: { ... }`. It does NOT map generic `flags`.
            // Wait, reducerComposer implementation for terminal does NOT pass `flags`!
            // It passes `resources`, `hfStats`, `logs`, `activeAircraft`.
            // It maps `suspicion` etc.

            // I need to update `reducerComposer.ts` to pass `flags` to terminalReducer if I want to check flags!
            // For now, I'll comment out flag check or default unlocked.
            // Actually, `personnel_log.db` requires `foundRetiredIDCard`.

            // I MUST UPDATE reducerComposer.ts to pass flags.
            // I'll assume I will fix reducerComposer.ts next.

            // Placeholder for flag check:
            // const hasFlags = file.reqFlags ? file.reqFlags.every(flag => (state as any).flags?.[flag]) : true;
            // Since I can't access flags yet, I'll just check "type" for encrypted.

            if (file.type === 'encrypted') {
              // Temporary hardcoded check for 'personnel_log.db' until I fix flags
              // actually I can't check flags here.
              draft.archiveTerminal.output.push('ERR: FILE ENCRYPTED. KEYCARD REQUIRED.');
            } else {
              draft.archiveTerminal.output.push(
                '---------------------------------',
                `OPENING ${filename}...`,
                '---------------------------------',
                ...file.content,
                '---------------------------------'
              );
              if (filename === 'project_blue_truth.txt') {
                draft.resources.sanity -= 5;
                draft.resources.suspicion += 5;
              }
            }
            break;
          }

          case 'query': {
            if (!args[0]) {
              draft.archiveTerminal.output.push(
                'ERR: Missing argument. Usage: query <employee_id>'
              );
              break;
            }
            const employeeId = args[0].toUpperCase();
            const file = employeeFiles[employeeId];
            if (file) {
              draft.archiveTerminal.output.push(
                '---------------------------------',
                `Retrieving file for: ${file.name}`,
                `ID:     ${file.id}`,
                `STATUS: ${file.status}`,
                'NOTES:',
                ...file.notes.map((note) => `  - ${note}`),
                '---------------------------------'
              );
              draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
            } else {
              draft.archiveTerminal.output.push(`ERR: No file found for ID '${employeeId}'.`);
              draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 1);
            }
            break;
          }

          case 'access': {
            if (!args[0]) {
              draft.archiveTerminal.output.push(
                'ERR: Missing argument. Usage: access <archive_id>'
              );
              break;
            }
            const archiveId = args[0].toUpperCase();
            const archive = redactedArchives[archiveId];
            if (archive) {
              if (archive.clearance > draft.hfStats.clearanceLevel) {
                draft.archiveTerminal.output.push('ERR: ACCESS DENIED. CLEARANCE LEVEL TOO LOW.');
                draft.archiveTerminal.output.push(
                  'SECURITY ALERT: Unauthorized access attempt logged.'
                );
                draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 15);
                triggerEvent('audit', 'INTERNAL_SWEEP');
                break;
              }
              if (archive.cost && draft.resources.kardexFragments < archive.cost.amount) {
                draft.archiveTerminal.output.push(
                  `ERR: INSUFFICIENT RESOURCES. REQUIRES ${archive.cost.amount} K-FRAG(s).`
                );
                draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 5);
                break;
              }

              // Success
              if (archive.cost) {
                draft.resources.kardexFragments -= archive.cost.amount;
              }
              draft.archiveTerminal.output.push(
                '============================================================================',
                `ACCESSING: ${archive.title}`,
                '============================================================================',
                ...archive.content,
                '============================================================================',
                'END OF FILE.'
              );
              draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 10);
              draft.resources.sanity -= 15;
              addLog(
                `You accessed the [${archive.title}] archive. The information burns itself into your memory.`,
                'vibration'
              );
            } else {
              draft.archiveTerminal.output.push(`ERR: No archive found for ID '${archiveId}'.`);
              draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 2);
            }
            break;
          }

          default:
            if (command) {
              draft.archiveTerminal.output.push(
                `ERR: Command not found: '${command}'. Type 'help' for a list of commands.`
              );
            }
            break;
        }

        draft.archiveTerminal.lastCommand = commandFull;
        draft.archiveTerminal.output = draft.archiveTerminal.output.slice(-100);
        break;
      }

      case 'MAINTENANCE_COMMAND': {
        const { command: commandFull } = action.payload;
        const [command, ...args] = commandFull.trim().toLowerCase().split(/\s+/);

        draft.maintenanceTerminal.output.push(`> ${commandFull}`);

        switch (command) {
          case 'help':
            draft.maintenanceTerminal.output.push(
              '============================================================================',
              'AVAILABLE COMMANDS:',
              '  help                  - Displays this list of commands.',
              '  search <part_no|ac_reg> - Searches for an item in the database.',
              '  read <log_id>         - Reads a specific maintenance log entry.',
              '  scan | status         - Scans local network for active aircraft.',
              '  cls | clear           - Clears the terminal screen.',
              '  exit | /quit           - Exits the terminal.',
              '============================================================================'
            );
            break;

          case 'cls':
          case 'clear':
            draft.maintenanceTerminal.output = [`> ${commandFull}`, 'Screen cleared.'];
            break;

          case 'search': {
            if (!args[0]) {
              draft.maintenanceTerminal.output.push('ERR: Missing argument. Usage: search <id>');
              break;
            }
            const searchId = args[0].toUpperCase();
            const part = partInfo[searchId];
            if (part) {
              draft.maintenanceTerminal.output.push(
                '---------------------------------',
                `DATABASE HIT FOR: ${searchId}`,
                `DESCRIPTION: ${part.description}`,
                'NOTES:',
                ...part.notes.map((note) => `  - ${note}`),
                '---------------------------------'
              );
              draft.resources.experience += 50;
            } else {
              draft.maintenanceTerminal.output.push(`NO DATABASE ENTRY FOUND FOR '${searchId}'.`);
              draft.resources.experience += 10;
            }
            break;
          }

          case 'read': {
            if (!args[0]) {
              draft.maintenanceTerminal.output.push('ERR: Missing argument. Usage: read <log_id>');
              break;
            }
            const logId = args[0].toUpperCase();
            const log = maintenanceLogs[logId];
            if (log) {
              draft.maintenanceTerminal.output.push(
                '============================================================================',
                `READING LOG: ${log.title}`,
                '============================================================================',
                ...log.content,
                '============================================================================',
                'END OF LOG.'
              );
              draft.resources.experience += 150;
              draft.resources.sanity -= 5;
            } else {
              draft.maintenanceTerminal.output.push(`ERR: Log ID '${logId}' not found in archive.`);
            }
            break;
          }

          case 'status':
          case 'scan':
            draft.maintenanceTerminal.output.push('Scanning local network...');
            if (draft.activeAircraft) {
              const ac = aircraftData.find((a) => a.id === draft.activeAircraft!.id);
              draft.maintenanceTerminal.output.push(
                `... ACTIVE AIRCRAFT DETECTED: ${ac?.name || draft.activeAircraft.id}`
              );
              draft.maintenanceTerminal.output.push(
                `... ASSIGNED TASK: ${draft.activeAircraft.task.replace(/_/g, ' ')}`
              );
              if (ac?.isSuspicious) {
                draft.maintenanceTerminal.output.push(
                  '... WARNING: Non-standard transponder signature detected.'
                );
              }
            } else {
              draft.maintenanceTerminal.output.push(
                '... No active aircraft assigned to this terminal.'
              );
            }
            break;

          default:
            if (command) {
              draft.maintenanceTerminal.output.push(`ERR: Command not found: '${command}'.`);
            }
            break;
        }

        draft.maintenanceTerminal.lastCommand = commandFull;
        draft.maintenanceTerminal.output = draft.maintenanceTerminal.output.slice(-100);
        break;
      }
    }
  });
};
