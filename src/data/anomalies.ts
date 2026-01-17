import { JobCard } from '../types';

export interface AnomalyTemplate {
  id: string;
  name: string;
  description: string;
  retrofitJob: Omit<JobCard, 'id' | 'timeLeft' | 'totalTime'>;
}

export const anomaliesData: AnomalyTemplate[] = [
  {
    id: 'ANOM_RESONATOR_1',
    name: 'Harmonic Crystalline Resonator',
    description:
      'A piece of smoked quartz that vibrates at a frequency that is technically impossible. It makes the air around it feel warm and taste of sugar.',
    retrofitJob: {
      title: 'Retrofit Galley Coffee Maker',
      description:
        'Retrofit the galley coffee maker with a resonance-based heating element derived from the anomalous resonator. This should make it... more efficient.',
      requirements: {
        crystallineResonators: 5,
        alclad: 20,
      },
      rewardXP: 2000,
      isRetrofit: true,
      bonusId: 'focus_regen_coffee',
    },
  },
  {
    id: 'ANOM_FILAMENT_1',
    name: 'Bio-Mechanical Filament',
    description:
      'A strand of what looks like fiber-optic cable, except it contracts rhythmically like muscle tissue and bleeds a thin, clear fluid when cut.',
    retrofitJob: {
      title: 'Reinforce Hydraulic Lines',
      description:
        'Weave the bio-filaments into the existing hydraulic lines. The organic material should self-seal minor leaks, increasing system resilience.',
      requirements: {
        bioFilament: 10,
        skydrol: 1,
      },
      rewardXP: 2500,
      isRetrofit: true,
      bonusId: 'tool_degrade_resist',
    },
  },
];
