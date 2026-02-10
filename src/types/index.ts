/**
 * 登录类型
 */
export enum LoginType {
  /** 无限制 */
  None = 1,
  /** 已登录 */
  Logged = 2,
  /** 未登录 */
  UnLogged = 3,
}

/**
 * 组件信息
 */
export interface ComponentInfo {
  id: number;
  type: string;
  login_type: LoginType;
  asLayout?: boolean;
  data?: Record<string, unknown>;
}
