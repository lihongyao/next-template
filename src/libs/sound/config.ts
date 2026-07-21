import type { SoundDefinition } from './types';

export const SOUND_CONFIG = {
  button_click: {
    src: ['/sounds/btn_click.mp3'],
    preload: 'eager',
    volume: 0.7,
    pool: 3,
    interrupt: true,
  },
  event_sound: {
    src: ['/sounds/event_sound.mp3'],
    preload: 'eager',
    volume: 0.7,
    pool: 3,
    interrupt: true,
  },
  get_reward_money: {
    src: ['/sounds/get_reward_money.mp3'],
    preload: 'eager',
    volume: 0.7,
    pool: 3,
    interrupt: true,
  },
} as const satisfies Record<string, SoundDefinition>;

export type SoundName = keyof typeof SOUND_CONFIG;
