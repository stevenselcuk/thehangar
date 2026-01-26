export const SOUNDS = {
  CLICK: '/sounds/ui_click.mp3',
  LEVEL_UP: '/sounds/level_up.mp3',
  SHOCKED: '/sounds/shocked.mp3',
  ALARM: '/sounds/alarm_siren.mp3',
} as const;

export type SoundType = keyof typeof SOUNDS;
