import type { BaseSDK } from './base-sdk';
import {
  type IReportSDK,
  type ReportTask,
  type SDKBootstrapOptions,
  type SDKInitContext,
  type SDKInstanceMap,
  SDKName,
} from './types';

/**
 * SDK 管理器单例，负责所有 SDK 的注册、初始化生命周期与统一上报。
 */
export class SDKManager {
  /** SDKManager 单例实例 */
  private static instance: SDKManager | null = null;
  /** SDK 映射表 */
  private sdkMap = new Map<SDKName, BaseSDK>();
  /** 上报事件队列（避免初始化未完成时重复上报） */
  private reportQueue: ReportTask[] = [];
  /** 是否已完成初始化 */
  private initialized = false;
  /** 初始化中的 Promise，用于并发调用时复用 */
  private initPromise: Promise<void> | null = null;
  /** 是否开启调试日志 */
  private debug = false;
  /** 私有构造函数 */
  private constructor() {}

  /**
   * 获取 SDKManager 单例实例。
   * @returns SDKManager 单例
   */
  static getInstance(): SDKManager {
    if (!SDKManager.instance) {
      SDKManager.instance = new SDKManager();
    }
    return SDKManager.instance;
  }

  /**
   * 注册 SDK 实例
   */
  register(sdk: BaseSDK): BaseSDK {
    if (this.sdkMap.has(sdk.name)) {
      if (this.debug) {
        console.warn(`[SDKManager] ${sdk.name} 已注册，复用已有实例`);
      }
      return this.sdkMap.get(sdk.name) ?? sdk;
    }

    this.sdkMap.set(sdk.name, sdk);
    return sdk;
  }

  /**
   * 统一初始化所有已注册的 SDK
   */
  async bootstrap(options?: SDKBootstrapOptions): Promise<void> {
    this.debug = options?.debug ?? this.debug;

    if (this.initialized) {
      if (this.debug) {
        console.warn('[SDKManager] 已完成初始化，直接跳过');
      }
      return;
    }

    if (this.initPromise) {
      if (this.debug) {
        console.log('[SDKManager] 初始化中，请稍等');
      }
      await this.initPromise;
      return;
    }

    if (this.sdkMap.size === 0) {
      if (this.debug) {
        console.warn('[SDKManager] 未注册任何 SDK，无法初始化');
      }
      this.initialized = true;
      return;
    }

    this.initPromise = this.bootstrapRegisteredSDKs(options);
    await this.initPromise;
  }

  /**
   * 统一初始化所有已注册的 SDK，并刷新上报队列。
   *
   * @internal
   */
  private async bootstrapRegisteredSDKs(options?: SDKBootstrapOptions): Promise<void> {
    try {
      const context: SDKInitContext = {
        config: options?.config,
        debug: options?.debug ?? false,
      };

      this.debug = context.debug ?? false;

      if (this.debug) {
        console.log(`[SDKManager] Initializing ${this.sdkMap.size} SDK(s)...`);
      }

      const allSDKs = Array.from(this.sdkMap.values());
      await this.initSDKs(allSDKs, context);

      this.initialized = true;
      this.flushReportQueue();
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * 为指定 SDK 创建隔离的配置上下文，仅包含该 SDK 的 config，避免 SDK 间互相读取配置。
   * @param sdk - 目标 SDK
   * @param baseContext - 原始初始化上下文
   * @returns 仅含该 SDK 配置的上下文
   * @internal
   */
  private createIsolatedContext(sdk: BaseSDK, baseContext: SDKInitContext): SDKInitContext {
    if (!baseContext.config) {
      return {
        ...baseContext,
        config: undefined,
      };
    }

    const sdkConfig = baseContext.config[sdk.name as keyof typeof baseContext.config];
    const isolatedConfig =
      sdkConfig !== undefined
        ? ({
            [sdk.name]: sdkConfig,
          } as Partial<SDKInitContext['config']>)
        : undefined;

    return {
      ...baseContext,
      config: isolatedConfig,
    };
  }

  /**
   * 初始化一组 SDK，单个 SDK 失败不影响其他 SDK。
   * @param sdks - 待初始化的 SDK 列表
   * @param context - 初始化上下文（已按 SDK 隔离）
   * @internal
   */
  private async initSDKs(sdks: BaseSDK[], context: SDKInitContext): Promise<void> {
    if (sdks.length === 0) return;

    const results = await Promise.all(sdks.map((sdk) => this.initSDK(sdk, context)));
    const successCount = results.filter(Boolean).length;
    const failCount = results.length - successCount;

    if (this.debug) {
      console.log(`[SDKManager] SDK 初始化完成: ${successCount} succeeded, ${failCount} failed`);
    }
  }

  private async initSDK(sdk: BaseSDK, context: SDKInitContext): Promise<boolean> {
    try {
      const isolatedContext = this.createIsolatedContext(sdk, context);
      await sdk.init(isolatedContext);

      if (!sdk.isReady && this.debug) {
        console.warn(`[SDKManager] ${sdk.name} 初始化结束，但 SDK 未 ready`);
      }

      return sdk.isReady;
    } catch (error) {
      if (this.debug) {
        console.error(`[SDKManager] SDK ${sdk.name} 初始化失败:`, error);
      }
      return false;
    }
  }

  /**
   * 将事件上报到所有已就绪且支持 report 的 SDK；若尚未初始化则写入队列，初始化完成后自动补发。
   * @param event - 事件名
   * @param params - 可选，事件参数
   */
  report(event: string, params?: Record<string, unknown>) {
    if (!this.initialized || this.initPromise) {
      this.enqueueReport(event, params);
      return;
    }

    let reported = false;
    this.sdkMap.forEach((sdk) => {
      if (this.isReportSDK(sdk) && sdk.isReady) {
        try {
          const result = sdk.report(event, params);
          reported = true;
          if (this.isPromiseLike(result)) {
            result.catch((error) => {
              console.error(`[SDKManager] Report failed for ${sdk.name}:`, error);
            });
          }
        } catch (error) {
          console.error(`[SDKManager] Report failed for ${sdk.name}:`, error);
        }
      }
    });

    if (this.debug && !reported) {
      console.warn(`[SDKManager] 未找到可用的上报 SDK，事件已丢弃: ${event}`);
    }
  }

  /**
   * 按名称获取已注册的 SDK 实例，类型与 SDKName 对应。
   * @param name - SDK 名称
   * @returns 对应类型的 SDK 实例，未注册则返回 undefined
   */
  getSDK<T extends SDKName>(name: T): SDKInstanceMap[T] | undefined {
    return this.sdkMap.get(name) as SDKInstanceMap[T] | undefined;
  }

  /**
   * 返回当前已注册的所有 SDK 名称列表。
   * @returns SDK 名称数组
   */
  getRegisteredSDKs(): SDKName[] {
    return Array.from(this.sdkMap.keys());
  }

  /**
   * 是否已完成首轮 bootstrap 初始化。
   * @returns 已初始化为 true，否则为 false
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 将未初始化时积压的上报任务按顺序重新上报一次，并清空队列。
   * @internal
   */
  private flushReportQueue(): void {
    if (this.reportQueue.length === 0) {
      return;
    }

    const tasks = [...this.reportQueue];
    this.reportQueue = [];

    if (this.debug) {
      console.log(`[SDKManager] Flushing ${tasks.length} queued events`);
    }

    tasks.forEach((task) => {
      this.report(task.event, task.params);
    });
  }

  private enqueueReport(event: string, params?: Record<string, unknown>): void {
    this.reportQueue.push({
      event,
      params,
      createdAt: Date.now(),
    });

    if (this.debug) {
      console.log(`[SDKManager] Queued report event: ${event}`);
    }
  }

  /**
   * 类型守卫：判断 SDK 是否实现上报接口（含 report 方法）。
   * @param sdk - 任意已注册的 SDK 实例
   * @returns 若支持 report 则为 true，且类型收窄为 BaseSDK & IReportSDK
   * @internal
   */
  private isReportSDK(sdk: BaseSDK): sdk is BaseSDK & IReportSDK {
    return typeof (sdk as unknown as IReportSDK).report === 'function';
  }

  private isPromiseLike<T>(value: unknown): value is Promise<T> {
    return typeof (value as Promise<T> | undefined)?.then === 'function';
  }
}

export const sdkManager = SDKManager.getInstance();
