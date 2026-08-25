import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { ROUTED_ACTIONS } from '@/state/reducerComposer.ts';

/**
 * Actions intercepted by App.tsx's onAction before dispatch. These open
 * modals or run visual effects and never reach the reducer.
 */
const UI_INTERCEPTED = new Set([
  'SHOW_ID_CARD',
  'OPEN_ARCHIVE_TERMINAL',
  'OPEN_MAINTENANCE_TERMINAL',
  'START_NAP_VISUAL',
]);

/** Actions gameReducer handles directly, before consulting the router. */
const REDUCER_LEVEL = new Set(['IMPORT_STATE', 'ACTION_SPAM_PENALTY']);

/**
 * Actions with a rendered button but no handler anywhere. Implemented in
 * Phase 2 (Tasks 5-7); each is removed from this list by its own task.
 */
const PENDING_IMPLEMENTATION = new Set([
  'OVERHAUL_IDG',
  'REPAIR_HP_VALVE',
  'RECONFIGURE_ADIRS',
  'REPAIR_GALLEY_UNIT',
]);

const SRC = path.resolve(__dirname, '../../src');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function collectDispatchedActions(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const files = [...walk(path.join(SRC, 'components')), path.join(SRC, 'App.tsx')];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/onAction\(\s*'([A-Z0-9_]+)'/g)) {
      const action = match[1];
      const where = found.get(action) ?? [];
      where.push(path.relative(SRC, file));
      found.set(action, where);
    }
  }
  return found;
}

describe('dispatch coverage', () => {
  it('routes every action the UI can dispatch', () => {
    const dispatched = collectDispatchedActions();
    expect(dispatched.size).toBeGreaterThan(50);

    const unroutable = [...dispatched.entries()]
      .filter(([action]) => !ROUTED_ACTIONS.has(action))
      .filter(([action]) => !UI_INTERCEPTED.has(action))
      .filter(([action]) => !REDUCER_LEVEL.has(action))
      .filter(([action]) => !PENDING_IMPLEMENTATION.has(action))
      .map(([action, files]) => `${action} (${files.join(', ')})`);

    expect(unroutable).toEqual([]);
  });
});
