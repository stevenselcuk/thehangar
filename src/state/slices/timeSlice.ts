import { produce } from 'immer';
import { TimeState } from '../../types';

export const SHIFT_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours (Game Time)
export const TIME_SCALE = 24; // 1 Real Hour = 1 Game Day (24 Game Hours)

export interface TimeAction {
  type: string;
  payload: {
    delta: number;
    now?: number;
  };
}

export const initialTimeState: TimeState = {
  totalPlayTime: 0,
  sessionTime: 0,
  shiftTime: 0,
  shiftCycle: 1,
  lastTick: 0,
};

export const timeReducer = (state: TimeState = initialTimeState, action: TimeAction): TimeState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'TIME_TICK': {
        const { delta, now } = action.payload;

        // Update basic counters (Real Time)
        draft.totalPlayTime += delta;
        draft.sessionTime += delta;

        // Update Game Time counters (Scaled)
        draft.shiftTime += delta * TIME_SCALE;

        if (now) {
          draft.lastTick = now;
        }

        // Check for shift cycle completion (Based on Game Time)
        if (draft.shiftTime >= SHIFT_DURATION_MS) {
          /*
           * In Standard Scale (24x):
           * 1 Real Sec = 24 Game Secs
           * 8 Game Hours = 28,800,000 ms
           * 28,800,000 / 24 = 1,200,000 ms (Real Time) = 20 Real Minutes
           */
          const shiftspassed = Math.floor(draft.shiftTime / SHIFT_DURATION_MS);
          draft.shiftCycle += shiftspassed;
          draft.shiftTime %= SHIFT_DURATION_MS;

          // Optionally triggered events could be handled here via flags or side effects
          // but strictly state-wise, we just rollover.
        }
        break;
      }

      case 'RESET_SESSION': {
        draft.sessionTime = 0;
        break;
      }
    }
  });
};
