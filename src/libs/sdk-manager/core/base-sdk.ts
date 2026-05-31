import type { ISDK, SDKInitContext, SDKInitReturn, SDKName } from './types';

// SDK 基础抽象类，所有 SDK 必须继承此类
export abstract class BaseSDK implements ISDK {
  /** SDK 名称 */
  public abstract readonly name: SDKName;

  /** 初始化状态 */
  protected ready = false;

  /** 初始化方法 */
  abstract init(context: SDKInitContext): SDKInitReturn;

  /** 是否已初始化完成 */
  get isReady(): boolean {
    return this.ready;
  }

  /** 标记为已就绪，子类在初始化完成后调用 */
  protected markReady(): void {
    this.ready = true;
  }
}
