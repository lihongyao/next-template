import type { ComponentInfo } from '@/types';

import { WidgetType } from '.';

export type NestedObject = Record<string, unknown>;

/**
 * 获取组件渲染所需的数据
 */
export interface GetDataPayload {
  /** 接口返回的组件配置 */
  component: ComponentInfo;
  /** 其他参数 */
  [__props_: string]: unknown;
}

/**
 * 获取组件渲染所需的数据 - 响应结果
 * 注意：data 数据必须包含 component 字段，同时可扩展其他字段
 * @param data 渲染所需的数据
 */
export interface GetDataRes<T = NestedObject> {
  data: T & { component: ComponentInfo };
}

/**
 * 动态组件配置
 */
export interface WidgetConfig<T = NestedObject> {
  /** 组件类型，必须和接口返回的组件中的 type 值一致 */
  type: WidgetType;

  /**
   * 在 SSR 阶段获取组件渲染所需的数据（按需）
   * @param payload 后端返回的组件配置 ComponentInfo
   * @retrun GetDataRes<T>
   */
  getData: (payload: GetDataPayload) => Promise<GetDataRes<T>>;
}
