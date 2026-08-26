import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { eventsData } from '@/data/events.ts';
import { ROUTED_ACTIONS } from '@/state/routedActions.ts';
import type { GameEvent } from '@/types.ts';

const SRC = path.resolve(__dirname, '../../src');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** Every real event id, grouped by the category (pool) it lives in. */
function eventIdsByCategory(): Map<string, Set<string>> {
  const byCategory = new Map<string, Set<string>>();
  for (const [category, pool] of Object.entries(eventsData)) {
    byCategory.set(category, new Set((pool as { id: string }[]).map((event) => event.id)));
  }
  return byCategory;
}

/**
 * Mirrors resolveSuccessorRef in src/state/slices/eventsSlice.ts: a raw
 * reference is either `category:id` (looked up in the named category) or a
 * bare id (accepted if it exists in ANY category, since the fallback
 * category at the call site depends on runtime state this static scan
 * doesn't have).
 */
function resolves(rawId: string, byCategory: Map<string, Set<string>>): boolean {
  const separatorIndex = rawId.indexOf(':');
  if (separatorIndex === -1) {
    for (const ids of byCategory.values()) {
      if (ids.has(rawId)) return true;
    }
    return false;
  }
  const category = rawId.slice(0, separatorIndex);
  const id = rawId.slice(separatorIndex + 1);
  return byCategory.get(category)?.has(id) ?? false;
}

function referencedIds(): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  const patterns = [
    /triggerEvent\(\s*'[a-z_]+'\s*,\s*'([^']+)'/g,
    /nextEventId:\s*'([^']+)'/g,
    /event:\s*\{\s*type:\s*'[a-z_]+'\s*,\s*id:\s*'([^']+)'/g,
  ];

  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file);
    if (/\.test\.tsx?$/.test(rel)) continue;

    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const where = refs.get(match[1]) ?? [];
        where.push(rel);
        refs.set(match[1], where);
      }
    }
  }
  return refs;
}

describe('event id integrity', () => {
  it('resolves every referenced event id to a real event', () => {
    const byCategory = eventIdsByCategory();
    const dangling = [...referencedIds().entries()]
      .filter(([id]) => !resolves(id, byCategory))
      .map(([id, files]) => `${id} <- ${[...new Set(files)].join(', ')}`)
      .sort();

    expect(dangling).toEqual([]);
  });
});

/**
 * Mirrors the only success path a requiredAction event has:
 * reducerComposer.resolveRequiredAction fires when a *dispatched action type*
 * equals event.requiredAction, which can only happen for a type composeAction
 * routes. A requiredAction naming anything else — maintenance prose, an
 * English task name, an action id that was never wired — is unsatisfiable,
 * and the event is a guaranteed timeout at its authored failure penalty.
 */
function unroutableRequiredActions(pools: Record<string, GameEvent[]>): string[] {
  return Object.values(pools)
    .flat()
    .filter((event) => event.requiredAction && !ROUTED_ACTIONS.has(event.requiredAction))
    .map((event) => `${event.id} -> ${event.requiredAction}`)
    .sort();
}

describe('requiredAction integrity', () => {
  it('names a routable action on every event that declares one', () => {
    expect(unroutableRequiredActions(eventsData as Record<string, GameEvent[]>)).toEqual([]);
  });

  it('actually rejects a requiredAction that names nothing routable', () => {
    // The negative side of the same predicate. Without this, the assertion
    // above would still pass if ROUTED_ACTIONS were ever empty, or if the
    // filter silently matched nothing.
    const authored: GameEvent = {
      id: 'FIXTURE_BAD',
      type: 'accident',
      title: 'Prose, not an action',
      description: 'test',
      timeLeft: 1000,
      totalTime: 1000,
      requiredAction: 'Isolate System B per AMM 29-11-00',
      failureOutcome: { log: 'Missed.' },
    };

    expect(unroutableRequiredActions({ accident: [authored] })).toEqual([
      'FIXTURE_BAD -> Isolate System B per AMM 29-11-00',
    ]);
  });

  it('accepts a requiredAction that names a routed action', () => {
    const authored: GameEvent = {
      id: 'FIXTURE_GOOD',
      type: 'accident',
      title: 'A real task',
      description: 'test',
      timeLeft: 1000,
      totalTime: 1000,
      requiredAction: 'PERFORM_NDT',
      failureOutcome: { log: 'Missed.' },
    };

    expect(unroutableRequiredActions({ accident: [authored] })).toEqual([]);
  });
});
