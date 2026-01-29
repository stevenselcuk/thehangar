export const GAME_CONSTANTS = {
  FPS: 15,
  SAVE_KEY: 'the_hangar_save__build_42',

  // Resources
  FOCUS_REGEN_BASE: 3.0,
  FOCUS_REGEN_NIGHT_CREW: 0.8,
  FOCUS_DRAIN_HALLUCINATION: 5.0,
  SANITY_DRAIN_BASE: 0.5,
  SANITY_DRAIN_FEAR_MULTIPLIER: 0.5, // Applied to regen? No, verified logic: Fear adds 0.5 to drain.

  // Cooldowns (in ms)
  MAIL_COOLDOWN: 3 * 60 * 1000,
  JANITOR_COOLDOWN: 10 * 60 * 1000,
  TOOLROOM_MASTER_COOLDOWN: 5 * 60 * 1000, // Estimated default

  // Probability
  RANDOM_EVENT_CHANCE: 0.0003,
  RANDOM_INCIDENT_CHANCE: 0.0001,

  // Audio
  AUDIO_VOLUMES: {
    CLICK: 0.3,
    LEVEL_UP: 0.5,
    SHOCKED: 0.6,
    ALARM: 0.4,
  },

  // Game Limits
  MAX_SUSPICION: 100,
  MAX_SANITY: 100,
  MAX_FOCUS: 100,
  CRITICAL_SUSPICION_THRESHOLDS: [30, 60, 90],
};

export const NOTIFICATION_DURATIONS = {
  DEFAULT: 4000,
  WARNING: 5000,
  SYSTEM: 8000,
};
