/**
 * 音效资源的加载时机。
 * - eager：应用初始化时加载并解码，适合高频、需要立即响应的音效。
 * - lazy：首次播放或显式预加载时再加载，适合低频音效。
 */
export type SoundPreloadStrategy = 'eager' | 'lazy';

/** 单个音效的资源与播放策略。 */
export interface SoundDefinition {
  /**
   * 按优先级排列的候选资源地址。
   * Howler 会选择当前浏览器支持的第一个格式，例如先尝试 WebM，再回退到 MP3。
   * 即使目前只有一个 MP3，也使用数组以便以后直接增加格式降级资源。
   */
  src: readonly string[];

  /** 加载策略；不填写时按 lazy 处理。 */
  preload?: SoundPreloadStrategy;

  /** 该音效的默认音量，范围为 0～1；默认值为 1。 */
  volume?: number;

  /** Howler 可复用的非活跃播放实例数量；默认值为 5。 */
  pool?: number;

  /** 再次播放同名音效前是否停止已有播放；默认值为 false。 */
  interrupt?: boolean;
}

/** Howler 为每次播放分配的实例 ID，可用于只停止某一次播放。 */
export type SoundId = number;
