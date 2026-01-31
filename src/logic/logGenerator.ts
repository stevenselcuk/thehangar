import { EVENT_RESOLUTION_TEMPLATES, ResolutionContext } from '../data/flavor';
import { GameState } from '../types';

/**
 * Generates a context-aware resolution log for an event.
 *
 * @param state - The current game state (for checking sanity, inventory, etc.)
 * @param eventType - The type of event (e.g., 'accident', 'bureaucratic_horror')
 * @param eventId - The specific ID of the event (optional, for specific overrides)
 * @returns A formatted string to be logged.
 */
export const generateResolutionLog = (
  state: { resources: GameState['resources']; inventory: GameState['inventory'] },
  eventType: string,
  _eventId?: string
): string => {
  // 1. Determine Context
  const context: ResolutionContext = {
    sanityLevel:
      state.resources.sanity > 70 ? 'high' : state.resources.sanity > 30 ? 'medium' : 'low',
    suspicionLevel:
      state.resources.suspicion > 70 ? 'high' : state.resources.suspicion > 30 ? 'medium' : 'low',
    department: 'GENERAL', // Default, can be refined based on event type
    tone: 'MUNDANE', // Default
  };

  // Refine Context based on Event Type
  if (eventType === 'bureaucratic_horror' || eventType === 'audit' || eventType === 'inspection') {
    context.tone = 'BUREAUCRATIC';
    context.department = 'HR';
  } else if (
    eventType === 'eldritch_manifestation' ||
    eventType === 'anomaly' ||
    state.resources.sanity < 20
  ) {
    context.tone = 'ELDRITCH';
  } else if (eventType === 'component_failure' || eventType === 'accident') {
    context.department = 'MAINTENANCE';
  } else if (eventType === 'canteen_incident') {
    context.department = 'LOGISTICS';
  }

  // 2. Filter Templates
  let eligibleTemplates = EVENT_RESOLUTION_TEMPLATES.filter((template) => {
    // Filter by Event Type (if specified in template)
    if (template.allowedEventTypes && !template.allowedEventTypes.includes(eventType)) {
      return false;
    }

    // Filter by Tone (if specified)
    if (template.tone && template.tone !== context.tone) {
      // Allow 'MUNDANE' to mix with others sometimes, but usually strict
      if (context.tone === 'ELDRITCH' && template.tone === 'BUREAUCRATIC') return false;
    }

    // Filter by Conditions (Sanity, Items, etc.)
    if (template.conditions) {
      if (template.conditions.minSanity && state.resources.sanity < template.conditions.minSanity)
        return false;
      if (template.conditions.maxSanity && state.resources.sanity > template.conditions.maxSanity)
        return false;
      if (
        template.conditions.minSuspicion &&
        state.resources.suspicion < template.conditions.minSuspicion
      )
        return false;
      if (
        template.conditions.requiredItem &&
        !state.inventory[template.conditions.requiredItem as keyof typeof state.inventory]
      )
        return false;
    }

    return true;
  });

  // Fallback if no templates match
  if (eligibleTemplates.length === 0) {
    eligibleTemplates = EVENT_RESOLUTION_TEMPLATES.filter(
      (t) => t.tone === 'MUNDANE' && !t.conditions
    );
  }

  // 3. Selection weighted by freshness (basic anti-repetition)
  // We check the last 20 logs to see if this text was used.
  // Ideally, we'd track template IDs, but we'll use text matching for now or if we add IDs to logs later.
  // For now, simple random.

  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

  // 4. Interpolation (Slot Filling)
  // Logic to replace [PLACEHOLDERS] could go here if templates use them.
  // For now, we assume static strings in templates, or simple replacements.

  return template.text;
};
