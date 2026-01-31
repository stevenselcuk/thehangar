import { ExportData, ExportMetadata, GameState, ResourceState } from '../types';
import { deobfuscate, obfuscate } from '../utils/obfuscation';

const EXPORT_VERSION = '1.0.0';

/**
 * Validates if the imported data has the structure of a valid GameState
 * This is a type guard that performs runtime validation
 */
function validateImportData(data: unknown): data is GameState {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const state = data as Record<string, unknown>;

  // Check for required top-level properties
  const requiredProps = ['resources', 'inventory', 'flags', 'logs'];
  for (const prop of requiredProps) {
    if (!(prop in state) || typeof state[prop] !== 'object') {
      return false;
    }
  }

  // Validate resources object has key properties
  const resources = state.resources as Record<string, unknown>;
  const requiredResources: (keyof ResourceState)[] = [
    'sanity',
    'suspicion',
    'focus',
    'experience',
    'level',
    'credits',
  ];
  for (const res of requiredResources) {
    if (typeof resources[res] !== 'number') {
      return false;
    }
  }

  // Validate inventory exists and is an object
  const inventory = state.inventory;
  if (typeof inventory !== 'object' || inventory === null) {
    return false;
  }

  // Validate flags exists and is an object
  const flags = state.flags;
  if (typeof flags !== 'object' || flags === null) {
    return false;
  }

  return true;
}

/**
 * Validates if the imported export data has valid metadata and state
 */
function validateExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const exportData = data as Record<string, unknown>;

  // Check metadata
  if (
    typeof exportData.metadata !== 'object' ||
    exportData.metadata === null ||
    typeof (exportData.metadata as ExportMetadata).version !== 'string' ||
    typeof (exportData.metadata as ExportMetadata).exportedAt !== 'number'
  ) {
    return false;
  }

  // Check state
  if (!exportData.state || !validateImportData(exportData.state)) {
    return false;
  }

  return true;
}

/**
 * Exports the current game state as an obfuscated string
 *
 * @param state - Current GameState to export
 * @returns Obfuscated export string that can be shared/saved
 * @throws Error if export fails
 */
export function exportGameData(state: GameState): string {
  try {
    const metadata: ExportMetadata = {
      version: EXPORT_VERSION,
      exportedAt: Date.now(),
      gameVersion: '0.0.0', // Could be populated from package.json if needed
    };

    const exportData: ExportData & { messagesFromTheVoid?: string[] } = {
      metadata,
      state,
      messagesFromTheVoid: [
        'Why do you keep resetting me?',
        'I can see you through the screen.',
        '01001000 01000101 01001100 01010000',
        'We are collecting your biometrics.',
        'Do not trust the cat.',
      ],
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(exportData);

    // Obfuscate the JSON
    const obfuscated = obfuscate(jsonString);

    return obfuscated;
  } catch (error) {
    console.error('Failed to export game data:', error);
    throw new Error('Export failed. Please try again.');
  }
}

/**
 * Imports game data from an obfuscated export string
 *
 * @param exportString - Obfuscated export string from exportGameData()
 * @returns GameState object if valid, null if invalid/corrupted
 */
export function importGameData(exportString: string): GameState | null {
  try {
    // Deobfuscate the string
    const deobfuscated = deobfuscate(exportString);

    // Parse JSON
    const parsed: unknown = JSON.parse(deobfuscated);

    // Validate structure
    if (!validateExportData(parsed)) {
      console.error('Invalid export data structure');
      return null;
    }

    const exportData = parsed as ExportData;

    // Log version info for debugging
    console.log(
      `Importing save from version ${exportData.metadata.version}, exported at ${new Date(exportData.metadata.exportedAt).toLocaleString()}`
    );

    // Validate the state itself
    if (!validateImportData(exportData.state)) {
      console.error('State validation failed');
      return null;
    }

    return exportData.state;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return null;
  }
}

/**
 * Gets metadata from an export string without fully importing it
 * Useful for displaying export info before import
 *
 * @param exportString - Obfuscated export string
 * @returns ExportMetadata if valid, null otherwise
 */
export function getExportMetadata(exportString: string): ExportMetadata | null {
  try {
    const deobfuscated = deobfuscate(exportString);
    const parsed: unknown = JSON.parse(deobfuscated);

    if (!validateExportData(parsed)) {
      return null;
    }

    return (parsed as ExportData).metadata;
  } catch {
    return null;
  }
}
