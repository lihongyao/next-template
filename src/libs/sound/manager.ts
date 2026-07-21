import { Howl, Howler } from 'howler';

import { SOUND_CONFIG, type SoundName } from './config';
import type { SoundDefinition, SoundId } from './types';

/**
 * 音效运行时管理器。
 * 负责创建和缓存 Howler 实例，并统一处理预加载、播放与资源释放。
 * 业务代码应优先使用 index.ts 导出的公共函数，而不是直接操作该类。
 */
export class SoundManager {
  /** 全局唯一的管理器实例。 */
  private static instance: SoundManager | null = null;

  /** 已创建的音效实例缓存，确保同一音效可以复用解码结果。 */
  private readonly sounds = new Map<SoundName, Howl>();

  /** 限制外部创建实例，统一通过 getInstance 获取单例。 */
  private constructor() {}

  /** 获取 SoundManager 单例。 */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }

    return SoundManager.instance;
  }

  /**
   * 预加载指定音效；不传名称时只加载配置为 eager 的音效。
   *
   * @param names 需要预加载的音效名称。
   */
  preload(names?: readonly SoundName[]): void {
    const targetNames =
      names ??
      (Object.keys(SOUND_CONFIG) as SoundName[]).filter(
        (name) => this.getDefinition(name).preload === 'eager',
      );

    targetNames.forEach((name) => {
      const sound = this.getOrCreateSound(name);
      if (sound?.state() === 'unloaded') {
        sound.load();
      }
    });
  }

  /**
   * 播放指定音效，并按配置决定是否打断同名音效的已有播放。
   *
   * @param name 音效配置名称。
   * @returns 本次播放的实例 ID；在服务端环境中返回 `undefined`。
   */
  play(name: SoundName): SoundId | undefined {
    const sound = this.getOrCreateSound(name);
    if (!sound) return undefined;

    if (this.getDefinition(name).interrupt) {
      sound.stop();
    }

    return sound.play();
  }

  /**
   * 停止指定音效；传入 ID 时只停止对应的单次播放。
   *
   * @param name 音效配置名称。
   * @param id 可选的播放实例 ID。
   */
  stop(name: SoundName, id?: SoundId): void {
    this.sounds.get(name)?.stop(id);
  }

  /**
   * 设置所有 Howler 音效的全局静音状态。
   *
   * @param muted 是否静音。
   */
  setMuted(muted: boolean): void {
    if (typeof window === 'undefined') return;
    Howler.mute(muted);
  }

  /**
   * 设置所有 Howler 音效的全局音量，并将数值限制在 0～1。
   *
   * @param volume 目标音量。
   */
  setVolume(volume: number): void {
    if (typeof window === 'undefined') return;
    Howler.volume(Math.min(1, Math.max(0, volume)));
  }

  /**
   * 停止并释放指定音效的实例和缓存。
   *
   * @param name 音效配置名称。
   */
  unload(name: SoundName): void {
    this.sounds.get(name)?.unload();
    this.sounds.delete(name);
  }

  /**
   * 获取统一类型的音效配置，兼容各配置项省略可选字段。
   *
   * @param name 音效配置名称。
   * @returns 对应的音效配置。
   */
  private getDefinition(name: SoundName): SoundDefinition {
    return SOUND_CONFIG[name];
  }

  /**
   * 获取缓存实例；尚未创建时根据配置创建一个新实例。
   *
   * @param name 音效配置名称。
   * @returns Howler 实例；在服务端环境中返回 `undefined`。
   */
  private getOrCreateSound(name: SoundName): Howl | undefined {
    if (typeof window === 'undefined') return undefined;

    const cachedSound = this.sounds.get(name);
    if (cachedSound) return cachedSound;

    const definition = this.getDefinition(name);
    const sound = new Howl({
      src: [...definition.src],
      preload: false,
      volume: definition.volume,
      pool: definition.pool,
      onloaderror: (_id, error) => this.reportError(name, 'load', error),
      onplayerror: (_id, error) => this.reportError(name, 'play', error),
    });

    this.sounds.set(name, sound);
    return sound;
  }

  /**
   * 开发环境输出加载或播放错误，生产环境保持静默。
   *
   * @param name 音效配置名称。
   * @param phase 发生错误的阶段。
   * @param error Howler 返回的错误信息。
   */
  private reportError(name: SoundName, phase: 'load' | 'play', error: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[SoundManager] Failed to ${phase} "${name}"`, error);
    }
  }
}
