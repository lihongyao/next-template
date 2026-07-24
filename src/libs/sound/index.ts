import type { SoundName } from './config';
import { SoundManager } from './manager';
import type { SoundId } from './types';

const soundManager = SoundManager.getInstance();

/**
 * 在首次用户手势中初始化音效系统并预加载 eager 音效。
 * 必须从 click、键盘等有效用户交互事件的同步调用栈中调用。
 *
 * @returns 是否已完成初始化；当前调用没有有效用户激活时返回 false。
 */
export function initializeSounds(): boolean {
  return soundManager.initialize();
}

/**
 * 预加载并解码音效资源，降低首次播放延迟。
 * 应用首次预加载请使用 `initializeSounds`；该方法适合 AudioContext 解锁后的按需预加载。
 *
 * @param names 指定要预加载的音效；不传时只加载配置为 `eager` 的音效。
 */
export function preloadSounds(names?: readonly SoundName[]): void {
  soundManager.preload(names);
}

/**
 * 播放指定音效。
 *
 * @param name 音效配置名称。
 * @returns 本次播放的实例 ID；在服务端环境调用时返回 `undefined`。
 */
export function playSound(name: SoundName): SoundId | undefined {
  return soundManager.play(name);
}

/**
 * 停止指定音效的播放。
 *
 * @param name 音效配置名称。
 * @param id 指定本次播放的实例 ID；不传时停止该音效的全部播放实例。
 */
export function stopSound(name: SoundName, id?: SoundId): void {
  soundManager.stop(name, id);
}

/**
 * 设置所有音效的全局静音状态。
 * 当前设置仅在本次页面会话中生效，不会持久化用户偏好。
 *
 * @param muted `true` 表示静音，`false` 表示恢复声音。
 */
export function setSoundMuted(muted: boolean): void {
  soundManager.setMuted(muted);
}

/**
 * 设置所有音效的全局音量。
 * 当前设置仅在本次页面会话中生效，不会持久化用户偏好。
 *
 * @param volume 音量值；超出 0～1 的值会被限制到该范围内。
 */
export function setSoundVolume(volume: number): void {
  soundManager.setVolume(volume);
}

/**
 * 停止并释放指定音效占用的资源和缓存。
 * 下次播放该音效时会重新创建实例并加载资源。
 *
 * @param name 音效配置名称。
 */
export function unloadSound(name: SoundName): void {
  soundManager.unload(name);
}

export type { SoundName } from './config';
export type { SoundId } from './types';
