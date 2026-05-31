// 参考文档：
// 1. IOS 壳包交互：IOS 壳包-Afuns H5交互
// 2. RN 交互：RN-Afuns H5 交互
import { BaseSDK } from '../core/base-sdk';
import { type IReportSDK, type SDKInitContext, SDKName } from '../core/types';

export interface JsBridgeSDKConfig {
  onLoaded?: () => void;
  /** 轮询间隔，默认 200ms */
  pollIntervalMs?: number;
  /** 等待原生桥注入的最长时间，默认 6000ms */
  timeoutMs?: number;
}

declare global {
  interface Window {
    // iOS
    webkit?: {
      messageHandlers?: {
        jsBridge?: { postMessage: (message: string) => void };
      };
    };
    // React Native
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    // 安卓 - FIXME：待处理
    jsbridge?: Record<string, (...args: unknown[]) => unknown>;
    // iOS WebView 注入的 SDK 数据缓存
    __getReportSdkDataCache?: Record<string, unknown> | null;
  }
}

type CallPayload = {
  cmd: string;
  params?: string | Record<string, unknown>;
};

const DEFAULT_POLL_INTERVAL_MS = 200;
const DEFAULT_TIMEOUT_MS = 6000;

export class JsBridgeSDK extends BaseSDK implements IReportSDK {
  public readonly name = SDKName.JsBridge;
  private env: 'rn' | 'ios' | 'android' | 'unknown' = 'unknown';
  private debug = false;
  private initPromise: Promise<void> | null = null;

  init(context: SDKInitContext): Promise<void> {
    const config = context.config?.[SDKName.JsBridge];
    this.debug = context.debug ?? false;

    if (this.isReady) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.log('init', config);

    this.initPromise = this.waitForBridge(config).finally(() => {
      this.initPromise = null;
    });

    return this.initPromise;
  }

  private setEnv() {
    if (window.ReactNativeWebView) {
      this.env = 'rn';
    } else if (window.webkit?.messageHandlers?.jsBridge) {
      this.env = 'ios';
    } else if (window.jsbridge) {
      this.env = 'android';
    } else {
      this.env = 'unknown';
    }
  }

  private call(payload: CallPayload): boolean {
    if (!this.isReady && !this.hasBridge()) {
      this.log('bridge not ready, call skipped', payload.cmd);
      return false;
    }

    try {
      this.setEnv();
      const isRn = this.env === 'rn';
      const isIos = this.env === 'ios';
      const isAndroid = this.env === 'android';
      const { cmd, params } = payload;
      const message = JSON.stringify({ cmd, params });
      if (isRn) {
        window.ReactNativeWebView?.postMessage(message);
        return true;
      } else if (isIos) {
        window.webkit?.messageHandlers?.jsBridge?.postMessage(message);
        return true;
      } else if (isAndroid) {
        const androidHandler = window.jsbridge?.[cmd];
        if (typeof androidHandler !== 'function') {
          return false;
        }

        if (params) {
          if (typeof params === 'object') {
            androidHandler(JSON.stringify(params));
            return true;
          } else {
            androidHandler(params);
            return true;
          }
        }
        androidHandler();
        return true;
      }
    } catch (error) {
      console.error('[JsBridgeSDK] postMessage error:', error);
    }

    return false;
  }

  updateToken(token: string): boolean {
    return this.call({ cmd: 'update_token', params: { token } });
  }

  updateLang(lang: 'en' | 'pt' | 'es'): boolean {
    return this.call({ cmd: 'update_lang', params: { lang } });
  }

  report(event: string, params?: Record<string, unknown>): boolean {
    return this.call({
      cmd: 'report',
      params: params ? { event, params } : { event },
    });
  }

  private waitForBridge(config?: JsBridgeSDKConfig): Promise<void> {
    if (typeof window === 'undefined') {
      const error = new Error('window is not available');
      return Promise.reject(error);
    }

    const pollIntervalMs = config?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const startedAt = Date.now();

    return new Promise<void>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      const finish = () => {
        cleanup();
        this.setEnv();
        this.markReady();
        this.log('ready', this.env);

        try {
          config?.onLoaded?.();
        } catch (error) {
          console.error('[JsBridgeSDK] onLoaded error:', error);
        }

        resolve();
      };

      const fail = () => {
        cleanup();
        reject(new Error(`js bridge is not ready after ${timeoutMs}ms`));
      };

      const tick = () => {
        if (this.hasBridge()) {
          finish();
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          fail();
          return;
        }

        timer = setTimeout(tick, pollIntervalMs);
      };

      tick();
    });
  }

  private hasBridge(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return Boolean(
      window.ReactNativeWebView || window.webkit?.messageHandlers?.jsBridge || window.jsbridge,
    );
  }

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log('[JsBridgeSDK]', ...args);
    }
  }
}
