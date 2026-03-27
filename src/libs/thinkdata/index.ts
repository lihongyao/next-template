/**
 * 数数科技
 * @See https://docs-v2.thinkingdata.cn/?version=latest&lan=zh-CN&code=javascript_sdk_installation
 */
import type thinkingdata from 'thinkingdata-browser';

import type { Report } from './types';

export type { Report };

export interface ThinkDataInstallConfig {
  appId: string;
  serverUrl: string;
  showLog?: boolean;
  autoTrack?: {
    pageShow?: boolean; // 开启页面展示事件，事件名ta_page_show
    pageHide?: boolean; // 开启页面隐藏事件，事件名ta_page_hide
    pageView?: boolean; // 开启单页面浏览事件，事件名ta_pageview
  };
  // 禁用预设属性，如 ['#os', '#ua']
  disablePresetProperties?: string[];
}

type QueuedEvent =
  | { [K in keyof Report]: { eventName: K; payload: Report[K] } }[keyof Report]
  | { eventName: string; payload: Record<string, unknown> };

const SESSION_KEY = 'td_url_params';

class ThinkData {
  public config: ThinkDataInstallConfig | null = null;
  public loaded = false;

  private ta: typeof thinkingdata | null = null;
  private accountId: string | null = null;
  private superProperties: Record<string, unknown> | null = null;
  private dynamicProperties: (() => Record<string, unknown>) | null = null;
  private eventQueue: QueuedEvent[] = [];
  private static instance: ThinkData | null = null;
  private constructor() {}

  /**
   * 获取单例实例
   * @returns
   */
  public static getInstance(): ThinkData {
    if (!ThinkData.instance) {
      ThinkData.instance = new ThinkData();
    }
    return ThinkData.instance;
  }

  /**
   * 安装 SDK
   * @param config 配置项
   */
  public async install(config: ThinkDataInstallConfig | null) {
    if (typeof window === 'undefined' || this.loaded) return;

    if (
      !config ||
      typeof config !== 'object' ||
      Object.keys(config).length === 0 ||
      !config.appId ||
      !config.serverUrl
    ) {
      console.log('数数上报配置为空，SDK 安装失败');
      return;
    }

    const ta = (await import('thinkingdata-browser')).default;

    // 初始化
    ta.init(config);

    // 清除公共属性（公共属性一旦设置，永久存在，除非手动清除，产品要求每次进入都按新的来）
    ta.clearSuperProperties();

    // 赋值属性
    this.ta = ta;
    this.config = config;
    this.loaded = true;

    // 判断是否在初始化之前设置了账号以及公共属性
    if (this.accountId) this.login(this.accountId);
    if (this.superProperties) this.setSuperProperties(this.superProperties);
    if (this.dynamicProperties) this.setDynamicSuperProperties(this.dynamicProperties);

    // 执行事件队列
    this._flushEventQueue();
  }

  /**
   * 执行事件队列
   */
  private _flushEventQueue() {
    if (!this.loaded || this.eventQueue.length === 0) return;
    this.eventQueue.forEach((event) => this.track(event.eventName, event.payload));
    this.eventQueue = [];
  }

  /**
   * -------------------
   * 事件上报
   * -------------------
   */

  /**
   * 发送事件
   * @param eventName 事件名
   * @param payload 对应事件名的属性类型
   */
  public track<K extends keyof Report | (string & {})>(
    eventName: K,
    payload: K extends keyof Report ? Report[K] : Record<string, unknown>,
  ) {
    // 如果还没有加载完成，则将事件加入队列，后续加载完成后再执行
    if (!this.loaded) {
      this.eventQueue.push({ eventName, payload } as QueuedEvent);
      return;
    }

    // FIXME: LEO 统一处理 from_path step_depth ad_type ad_id
    this.ta?.track(eventName as string, payload as Record<string, unknown>);
  }

  /**
   * 第一次上报
   * @param taEvent
   * @returns
   */
  public trackFirst(taEvent: object) {
    if (!this.loaded) return;
    this.ta?.trackFirst(taEvent);
  }

  /**
   * -------------------
   * 用户体系
   * -------------------
   */

  /**
   * 用户登录时调用
   * @param id
   */
  public login(id: string) {
    if (!this.loaded) {
      this.accountId = id;
      return;
    }
    this.ta?.login(id);
  }

  /**
   * 用户退出时调用
   * @returns
   */
  public logout() {
    if (!this.loaded) return;
    this.ta?.logout();
  }

  /**
   * -------------------
   * 公共属性
   * -------------------
   */

  /**
   * 静态属性，设置一次之后永久存在，除非清除
   * @param properties
   */
  public setSuperProperties(properties: Record<string, unknown>) {
    if (!this.loaded) {
      this.superProperties = properties;
      return;
    }
    this.ta?.setSuperProperties(properties);
  }

  /**
   * 清除公共属性
   * @returns
   */
  public clearSuperProperties() {
    if (!this.loaded) return;
    this.ta?.clearSuperProperties();
  }

  /**
   * 动态属性，每次上报都会执行函数
   * @param properties
   * @returns
   */
  public setDynamicSuperProperties(fn: () => Record<string, unknown>) {
    if (!this.loaded) {
      this.dynamicProperties = fn;
      return;
    }
    this.ta?.setDynamicSuperProperties(fn);
  }

  /**
   * -------------------
   * 用户属性（用户画像）
   * -------------------
   */

  /**
   * 设置属性（可多次设置，覆盖）
   * @param properties
   */
  public userSet(properties: Record<string, unknown>) {
    if (!this.loaded) return;
    this.ta?.userSet(properties);
  }

  /**
   * 设置属性（只设置一次）
   * @param properties
   * @returns
   */
  public userSetOnce(properties: Record<string, unknown>) {
    if (!this.loaded) return;
    this.ta?.userSetOnce(properties);
  }

  /**
   * -------------------
   * 其他工具函数
   * -------------------
   */

  /**
   * 解析 url 参数
   * @returns
   */
  public parseUrl() {
    const url = window.location.href;
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams);
    const hasQuery = Object.keys(params).length > 0;
    if (!hasQuery) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(params));
  }

  /**
   * 获取 url 参数
   * @returns
   */
  public getUrlParams() {
    const data = sessionStorage.getItem(SESSION_KEY);
    const result = data ? JSON.parse(data) : {};
    return result as Record<string, unknown>;
  }
}

const ThinkDataClient = ThinkData.getInstance();
export default ThinkDataClient;
