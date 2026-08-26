import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { AIRFRAME_CHECK_TASKS } from '@/data/aircraft.ts';
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

/**
 * Routable is not reachable.
 *
 * `ROUTED_ACTIONS.has(...)` only says composeAction knows where to send the
 * action if it is ever dispatched. Two further things have to be true before
 * a player can satisfy a timed event with it:
 *
 *  1. Some component has to dispatch it. `TIGHTEN_BOLT` and `REPAIR_ROTABLE`
 *     are both routed, and neither has ever had a button — an event naming
 *     one is a guaranteed timeout at its authored failure penalty.
 *  2. The button that dispatches it has to finish inside the event's timer.
 *     `ActionButton`'s `cooldown` is a *pre-action* delay: `onClick` fires
 *     after it elapses, and nothing pauses the event clock meanwhile. A
 *     90-second `CLEAN_ULD` cannot satisfy a 40-second event.
 *
 * This scans the shipped components for both. It is a source scan, which is
 * ugly, but the alternative is the property going unchecked — and it is the
 * property that decides whether an event is playable.
 */
interface DispatchSite {
  file: string;
  line: number;
  /** Pre-action delay in ms; null when the prop is not a literal. */
  cooldown: number | null;
}

const COMPONENTS = path.join(SRC, 'components');

/** Comments mention action ids in prose; a comment is not a button. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * Every action type the shipped UI dispatches from something the player can
 * click, with the pre-action cooldown of the click that dispatches it.
 *
 * DevMode is excluded on purpose: it is a developer cheat panel, and an
 * action reachable only from it is not reachable in play.
 */
function dispatchSites(): Map<string, DispatchSite[]> {
  const sites = new Map<string, DispatchSite[]>();
  const add = (type: string, site: DispatchSite) => {
    const list = sites.get(type) ?? [];
    list.push(site);
    sites.set(type, list);
  };

  const files = walk(COMPONENTS).filter(
    (file) => file.endsWith('.tsx') && !file.includes(`${path.sep}devmode${path.sep}`)
  );

  for (const file of files) {
    const source = stripComments(fs.readFileSync(file, 'utf8'));
    const name = path.relative(SRC, file);
    const lineOf = (index: number) => source.slice(0, index).split('\n').length;

    // <ActionButton ... /> — the cooldown-bearing affordance.
    const buttonRanges: [number, number][] = [];
    for (
      let at = source.indexOf('<ActionButton');
      at !== -1;
      at = source.indexOf('<ActionButton', at + 1)
    ) {
      const end = source.indexOf('/>', at);
      if (end === -1) continue;
      buttonRanges.push([at, end]);
      const chunk = source.slice(at, end);
      const literal = /cooldown=\{(\d+)\}/.exec(chunk);
      const dynamic = /cooldown=\{/.test(chunk);
      const cooldown = literal ? Number(literal[1]) : dynamic ? null : 0;
      for (const match of chunk.matchAll(/onAction\(\s*'([A-Z_]+)'/g)) {
        add(match[1], { file: name, line: lineOf(at), cooldown });
      }
    }

    // Plain elements with an onClick that dispatches. No cooldown exists on
    // these, so the click is immediate.
    for (const match of source.matchAll(/onClick=\{[^}]{0,400}?onAction\(\s*'([A-Z_]+)'/g)) {
      const at = match.index ?? 0;
      if (buttonRanges.some(([start, end]) => at >= start && at <= end)) continue;
      add(match[1], { file: name, line: lineOf(at), cooldown: 0 });
    }
  }

  return sites;
}

function unreachableRequiredActions(pools: Record<string, GameEvent[]>): string[] {
  const sites = dispatchSites();

  return Object.values(pools)
    .flat()
    .filter((event) => !!event.requiredAction)
    .flatMap((event) => {
      const required = event.requiredAction as string;
      const found = sites.get(required) ?? [];
      const where = `${event.id} -> ${required}`;

      if (found.length === 0) return [`${where}: no UI dispatch site`];

      // A story event (totalTime 0) and a component failure never expire, so
      // no cooldown can outrun their clock.
      if (event.totalTime <= 0) return [];

      const timed = found.filter(
        (site) => site.cooldown !== null && site.cooldown < event.totalTime
      );
      if (timed.length > 0) return [];

      const fastest = found
        .map((site) => (site.cooldown === null ? 'dynamic' : `${site.cooldown}ms`))
        .join('/');
      return [`${where}: button cooldown ${fastest} vs a ${event.totalTime}ms timer`];
    })
    .sort();
}

/**
 * `AIRCRAFT_ACTION` is an umbrella: the same action type carries a 40-focus
 * ETOPS check and a 5-focus cabin log read. An event that names it without
 * narrowing is satisfied by the cheapest button on the panel. The narrowing
 * has to stay inside the set the assigned-task button can actually dispatch,
 * or it swaps a trivial win for an unwinnable event.
 */
function badAircraftSubtypes(pools: Record<string, GameEvent[]>): string[] {
  return Object.values(pools)
    .flat()
    .filter((event) => event.requiredAction === 'AIRCRAFT_ACTION')
    .flatMap((event) => {
      const subtypes = event.requiredActionSubtypes ?? [];
      if (subtypes.length === 0) return [`${event.id}: no requiredActionSubtypes`];
      const unreachable = subtypes.filter(
        (sub) => !(AIRFRAME_CHECK_TASKS as string[]).includes(sub)
      );
      return unreachable.length > 0 ? [`${event.id}: ${unreachable.join(', ')}`] : [];
    })
    .sort();
}

/** An event that prints only its action id tells the player nothing. */
function missingRequiredActionLabels(pools: Record<string, GameEvent[]>): string[] {
  return Object.values(pools)
    .flat()
    .filter((event) => !!event.requiredAction && !event.requiredActionLabel?.trim())
    .map((event) => `${event.id} -> ${event.requiredAction}`)
    .sort();
}

describe('requiredAction reachability', () => {
  const authored = eventsData as unknown as Record<string, GameEvent[]>;

  const fixture = (event: Partial<GameEvent>): Record<string, GameEvent[]> => ({
    accident: [
      {
        id: 'FIXTURE',
        type: 'accident',
        title: 'Fixture',
        description: 'test',
        timeLeft: 30000,
        totalTime: 30000,
        failureOutcome: { log: 'Missed.' },
        ...event,
      } as GameEvent,
    ],
  });

  it('is scanning the real components', () => {
    // Guards every assertion below: if the scan returned nothing, an empty
    // unreachable list would be meaningless rather than reassuring.
    const sites = dispatchSites();
    expect(sites.get('PERFORM_NDT')?.length).toBeGreaterThan(0);
    expect(sites.get('CLEAN_ULD')?.[0]?.cooldown).toBe(90000);
    expect(sites.get('TIGHTEN_BOLT')).toBeUndefined();
  });

  it('names an action the player can actually perform in time, on every event', () => {
    expect(unreachableRequiredActions(authored)).toEqual([]);
  });

  it('reports an action that is routable but has no button', () => {
    expect(unreachableRequiredActions(fixture({ requiredAction: 'TIGHTEN_BOLT' }))).toEqual([
      'FIXTURE -> TIGHTEN_BOLT: no UI dispatch site',
    ]);
  });

  it('reports a button whose pre-action cooldown outlasts the event', () => {
    expect(
      unreachableRequiredActions(fixture({ requiredAction: 'CLEAN_ULD', totalTime: 40000 }))
    ).toEqual(['FIXTURE -> CLEAN_ULD: button cooldown 90000ms vs a 40000ms timer']);
  });

  it('accepts a button whose cooldown fits inside the event', () => {
    expect(
      unreachableRequiredActions(fixture({ requiredAction: 'CLEAN_ULD', totalTime: 120000 }))
    ).toEqual([]);
  });

  it('narrows every AIRCRAFT_ACTION event to the checks, not the log reads', () => {
    expect(badAircraftSubtypes(authored)).toEqual([]);
  });

  it('reports an AIRCRAFT_ACTION event that is left unnarrowed or narrowed to nothing clickable', () => {
    expect(badAircraftSubtypes(fixture({ requiredAction: 'AIRCRAFT_ACTION' }))).toEqual([
      'FIXTURE: no requiredActionSubtypes',
    ]);
    expect(
      badAircraftSubtypes(
        fixture({ requiredAction: 'AIRCRAFT_ACTION', requiredActionSubtypes: ['READ_CABIN_LOG'] })
      )
    ).toEqual(['FIXTURE: READ_CABIN_LOG']);
    expect(
      badAircraftSubtypes(
        fixture({ requiredAction: 'AIRCRAFT_ACTION', requiredActionSubtypes: ['DAILY_CHECK'] })
      )
    ).toEqual([]);
  });

  it('carries human-readable guidance on every event that requires an action', () => {
    expect(missingRequiredActionLabels(authored)).toEqual([]);
  });

  it('reports an event that would print only its action id', () => {
    expect(missingRequiredActionLabels(fixture({ requiredAction: 'PERFORM_NDT' }))).toEqual([
      'FIXTURE -> PERFORM_NDT',
    ]);
    expect(
      missingRequiredActionLabels(
        fixture({ requiredAction: 'PERFORM_NDT', requiredActionLabel: 'SRM 53-30-00 — NDT bench' })
      )
    ).toEqual([]);
  });
});
