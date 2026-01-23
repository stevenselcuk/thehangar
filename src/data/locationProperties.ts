import { TabType } from '../types';

export enum NoiseLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME_HIGH = 'EXTREME_HIGH',
}

export enum FatigueLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME_HIGH = 'EXTREME_HIGH',
}

export enum TemperatureLevel {
  EXTREME_LOW = 'EXTREME_LOW',
  LOW = 'LOW',
  COMFORT = 'COMFORT',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface LocationProperty {
  noise: NoiseLevel;
  fatigue: FatigueLevel;
  temperature: TemperatureLevel;
}

export const LOCATION_PROPERTIES: Record<TabType, LocationProperty> = {
  [TabType.STRUCTURE_SHOP]: {
    noise: NoiseLevel.HIGH,
    fatigue: FatigueLevel.HIGH,
    temperature: TemperatureLevel.HIGH,
  },
  [TabType.APRON_LINE]: {
    noise: NoiseLevel.EXTREME_HIGH,
    fatigue: FatigueLevel.EXTREME_HIGH,
    temperature: TemperatureLevel.EXTREME_LOW,
  },
  [TabType.HANGAR]: {
    noise: NoiseLevel.MEDIUM,
    fatigue: FatigueLevel.HIGH,
    temperature: TemperatureLevel.LOW,
  },
  [TabType.TERMINAL]: {
    noise: NoiseLevel.MEDIUM,
    fatigue: FatigueLevel.LOW,
    temperature: TemperatureLevel.MEDIUM,
  },
  [TabType.CANTEEN]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.LOW,
    temperature: TemperatureLevel.COMFORT,
  },
  [TabType.TRAINING]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.LOW,
    temperature: TemperatureLevel.COMFORT,
  },
  [TabType.HR_FLOOR]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.LOW,
    temperature: TemperatureLevel.COMFORT,
  },
  [TabType.TOOLROOM]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.MEDIUM,
    temperature: TemperatureLevel.LOW,
  },
  [TabType.BACKSHOPS]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.MEDIUM,
    temperature: TemperatureLevel.LOW,
  },
  [TabType.OFFICE]: {
    noise: NoiseLevel.LOW,
    fatigue: FatigueLevel.LOW,
    temperature: TemperatureLevel.COMFORT,
  },
  [TabType.AOG_DEPLOYMENT]: {
    noise: NoiseLevel.MEDIUM,
    fatigue: FatigueLevel.HIGH,
    temperature: TemperatureLevel.LOW,
  },
};
