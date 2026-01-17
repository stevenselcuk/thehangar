export const getXpForNextLevel = (level: number): number => {
  return Math.floor(1000 * Math.pow(level, 1.5));
};

export const getLevelUpLog = (newLevel: number): string => {
  if (newLevel <= 5) {
    return `[LEVEL UP] The routine feels less daunting. You're getting the hang of this.`;
  }
  if (newLevel <= 10) {
    return `[LEVEL UP] You know the sounds of this hangar better than your own heartbeat. The groans are familiar now.`;
  }
  if (newLevel <= 20) {
    return `[LEVEL UP] You don't just fix the machines anymore. You feel what they need. The distinction between metal and flesh is... blurring.`;
  }
  return `[LEVEL UP] The hangar accepts you. You are a part of its structure now.`;
};
