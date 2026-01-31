import { LogMessage } from '../types';

export const OFFLINE_LOGS_NORMAL = [
  'Shift report: Routine maintenance completed on GSE.',
  'Warning: Temperature fluctuations detected in Sector 4.',
  'System: Automatic data backup completed successfully.',
  "Notice: Canteen restocked with 'Meat-Like Product'.",
  'Log: Janitorial staff reported a spill near the chemical locker.',
  'Update: Firmware patch v4.0.1 applied to terminals.',
  'Shift report: No major incidents during night cycle.',
  'Maintenance: Hydraulic fluid levels topped off in Bay 2.',
];

export const OFFLINE_LOGS_CREEPY = [
  'Log: Motion sensor triggered in empty hangar. No personnel found.',
  'Warning: Unidentified scratching sounds recorded near ventilation.',
  'Error: Security camera feed corrupted for 47 minutes.',
  'Notice: Tool count mismatch. One wrench missing, then reappeared.',
  "Log: 'THEY ARE WATCHING' found scratched into bathroom stall.",
  'System: Unauthorized access attempt on restricted files. Origin: Internal.',
  "Shift report: Night crew reported feeling 'watched'.",
  'Warning: Carbon dioxide levels spiked briefly in the Void room.',
];

export const OFFLINE_LOGS_HORROR = [
  'CRITICAL: BIOLOGICAL CONTAMINANT DETECTED IN SECTOR 9.',
  'ERROR: 01001000 01000101 01001100 01010000',
  'Log: NightGuard#441 missing. Blood trail ends at the intake turbine.',
  'System: WHISPERS DETECTED ON ALL AUDIO CHANNELS.',
  'Security: Video logs show shadows moving against light sources.',
  'Alert: Containment breach in sublevel 3. Sealed automatically.',
  "Message: 'WHY DID YOU LEAVE US HERE?'",
  'Critical: Reality coherence dropped below 88% during night cycle.',
];

export const generateNightShiftLogs = (hoursAway: number, sanity: number): LogMessage[] => {
  const logs: LogMessage[] = [];
  const numLogs = Math.min(Math.floor(hoursAway), 5); // Max 5 logs per session

  for (let i = 0; i < numLogs; i++) {
    let pool = OFFLINE_LOGS_NORMAL;
    let type: LogMessage['type'] = 'info';

    // Chance for creepy/horror increments as sanity drops
    const horrorChance = (100 - sanity) / 100; // 0% at 100 sanity, 100% at 0
    const roll = Math.random();

    if (roll < horrorChance * 0.3) {
      // 30% of the horror chance is FULL HORROR
      pool = OFFLINE_LOGS_HORROR;
      type = 'warning'; // 'warning' usually vibrates or is red
    } else if (roll < horrorChance) {
      pool = OFFLINE_LOGS_CREEPY;
      type = 'story';
    }

    const text = pool[Math.floor(Math.random() * pool.length)];

    logs.push({
      id: `night-shift-${Date.now()}-${i}`,
      text: `[NIGHT SHIFT] ${text}`,
      type,
      timestamp: Date.now() - (numLogs - i) * 1000 * 60, // Stagger timestamps slightly
    });
  }

  return logs;
};
