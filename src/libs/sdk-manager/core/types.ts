import type { JsBridgeSDK, JsBridgeSDKConfig } from '../providers/js-bridge';

/**
 * 名称枚举
 * 新增 SDK 时需要在此注册
 */
export enum SDKName {
  JsBridge = 'js-bridge',
}

export interface SDKConfigMap {
  [SDKName.JsBridge]: JsBridgeSDKConfig;
}

export interface SDKInstanceMap {
  [SDKName.JsBridge]: JsBridgeSDK;
}

export type SDKInitReturn = Promise<void> | void;

/**
 * SDK 基础接口
 */
export interface ISDK {
  /** SDK 唯一名称 */
  readonly name: SDKName;
  /** 是否已初始化完成 */
  readonly isReady: boolean;
  /** 初始化方法 */
  init(context: SDKInitContext): SDKInitReturn;
}

/**
 * 支持上报的 SDK 接口
 */
export interface IReportSDK {
  report(event: string, params?: Record<string, unknown>): boolean | Promise<boolean>;
}

/**
 * SDK 初始化上下文，透传给每个 SDK 的 init 方法
 */
export interface SDKInitContext {
  /** SDK 配置信息，通过 SDKConfigMap 实现类型安全 */
  config?: Partial<SDKConfigMap>;
  /** 是否开启调试模式 */
  debug?: boolean;
}

export type SDKBootstrapOptions = SDKInitContext;

/**
 * 上报任务类型，用于在初始化前缓存上报事件
 */
export type ReportTask = {
  event: string;
  params?: Record<string, unknown>;
  createdAt: number;
};
