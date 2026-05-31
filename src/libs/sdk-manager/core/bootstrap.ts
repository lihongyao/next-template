import { JsBridgeSDK } from '../providers/js-bridge';
import { SDKManager } from './sdk-manager';
import type { SDKBootstrapOptions } from './types';

// 初始化 SDK，统一注册所有 SDK 并初始化
export async function bootstrapSDK(options?: SDKBootstrapOptions): Promise<void> {
  const manager = SDKManager.getInstance();

  manager.register(new JsBridgeSDK());

  await manager.bootstrap(options);
}
