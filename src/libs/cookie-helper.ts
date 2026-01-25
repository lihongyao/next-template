/**
 * Cookie Helper
 * 统一的 Cookie 操作工具，优先使用 cookieStore API，不兼容时回退到 document.cookie
 */

interface CookieStore extends EventTarget {
  get(name: string): Promise<CookieListItem | null>;
  getAll(name?: string): Promise<CookieListItem[]>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieStoreSetOptions): Promise<void>;
  delete(name: string): Promise<void>;
  delete(options: CookieStoreDeleteOptions): Promise<void>;
}

interface CookieListItem {
  name: string;
  value: string;
  domain?: string | null;
  path?: string;
  expires?: number | Date | null;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none' | null;
}

interface CookieStoreSetOptions {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number | Date;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CookieStoreDeleteOptions {
  name: string;
  domain?: string;
  path?: string;
}

interface CookieChangeEvent extends Event {
  changed: CookieListItem[];
  deleted: CookieListItem[];
}

type CookieChangeCallback = (name: string, value: string | null) => void;

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * 检测是否支持 cookieStore API（私有工具函数）
 */
function _supportsCookieStore(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const windowWithCookieStore = window as unknown as {
    cookieStore?: CookieStore;
  };
  return 'cookieStore' in window && typeof windowWithCookieStore.cookieStore === 'object';
}

/**
 * 使用 document.cookie 设置 cookie（私有工具函数）
 */
function _setCookieWithDocument(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') {
    console.warn('[CookieHelper] document is not available');
    return;
  }

  if (!name || typeof name !== 'string') {
    console.warn('[CookieHelper] Invalid cookie name');
    return;
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    const expires =
      options.expires instanceof Date
        ? options.expires
        : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * 使用 document.cookie 获取 cookie（私有工具函数）
 */
function _getCookieWithDocument(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  if (!name || typeof name !== 'string') {
    return undefined;
  }

  const cookies = document.cookie.split(';');
  const encodedName = encodeURIComponent(name);

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    const equalIndex = trimmedCookie.indexOf('=');
    if (equalIndex === -1) continue;

    const cookieName = trimmedCookie.substring(0, equalIndex).trim();
    const cookieValue = trimmedCookie.substring(equalIndex + 1).trim();

    if (cookieName === encodedName || cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return undefined;
}

/**
 * 使用 document.cookie 获取所有 cookie（私有工具函数）
 */
function _getAllCookiesWithDocument(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(';');

  for (const cookie of cookieStrings) {
    const trimmedCookie = cookie.trim();
    if (!trimmedCookie) continue;

    const equalIndex = trimmedCookie.indexOf('=');
    if (equalIndex === -1) continue;

    const name = trimmedCookie.substring(0, equalIndex).trim();
    const value = trimmedCookie.substring(equalIndex + 1).trim();

    if (name) {
      try {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      } catch (error) {
        cookies[name] = value;
      }
    }
  }

  return cookies;
}

/**
 * 使用 document.cookie 删除 cookie（私有工具函数）
 */
function _deleteCookieWithDocument(
  name: string,
  options: { path?: string; domain?: string } = {},
): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (!name || typeof name !== 'string') {
    return;
  }

  _setCookieWithDocument(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Cookie Helper 类
 * 提供统一的 Cookie 操作接口，自动选择最佳的底层实现
 */
class CookieHelper {
  private useCookieStore: boolean;
  private listeners: CookieChangeCallback[] = [];
  private cookieStore: CookieStore | null = null;

  constructor() {
    this.useCookieStore = _supportsCookieStore();

    if (this.useCookieStore && typeof window !== 'undefined') {
      this.cookieStore = (window as unknown as { cookieStore: CookieStore }).cookieStore;

      try {
        this.cookieStore.addEventListener(
          'change',
          (evt: Event) => {
            const changeEvent = evt as unknown as CookieChangeEvent;
            changeEvent.changed.forEach((c) => {
              this._emitChange(c.name, c.value);
            });
            changeEvent.deleted.forEach((c) => {
              this._emitChange(c.name, null);
            });
          },
          { passive: true },
        );
      } catch (error) {
        console.warn('[CookieHelper] Failed to add cookie change listener:', error);
      }
    }
  }

  private _emitChange(name: string, value: string | null): void {
    this.listeners.forEach((fn) => {
      try {
        fn(name, value);
      } catch (error) {
        console.error(`[CookieHelper] Error in change listener for ${name}:`, error);
      }
    });
  }

  /**
   * 监听 cookie 变化
   * 注意：仅在支持 cookieStore API 的浏览器中有效
   *
   * @param callback - 回调函数 (name, value)，value 为 null 表示删除
   */
  onChange(callback: CookieChangeCallback): void {
    if (typeof callback !== 'function') {
      console.warn('[CookieHelper] onChange callback must be a function');
      return;
    }
    this.listeners.push(callback);
  }

  /**
   * 移除 cookie 变化监听器
   *
   * @param callback - 要移除的回调函数（必须是同一个函数引用）
   */
  offChange(callback: CookieChangeCallback): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 设置 cookie
   *
   * 支持两种调用方式：
   * - set(name, value, options)
   * - set({ name, value, ...options })
   *
   * @param nameOrObj - Cookie 名称或包含 cookie 信息的对象
   * @param valueOrOptions - Cookie 值或选项
   * @param options - Cookie 选项
   */
  async set(
    nameOrObj: string | CookieStoreSetOptions,
    valueOrOptions?: string | CookieOptions,
    options?: CookieOptions,
  ): Promise<void> {
    if (this.useCookieStore && this.cookieStore) {
      try {
        if (typeof nameOrObj === 'object') {
          await this.cookieStore.set(nameOrObj);
          return;
        } else {
          if (typeof valueOrOptions !== 'string') {
            console.warn('[CookieHelper] When using string name, value must be a string');
            return;
          }

          const cookieOptions: CookieStoreSetOptions = {
            name: nameOrObj,
            value: valueOrOptions,
          };
          if (options) {
            Object.assign(cookieOptions, options);
          }
          await this.cookieStore.set(cookieOptions);
          return;
        }
      } catch (error) {
        console.warn(
          '[CookieHelper] cookieStore.set failed, falling back to document.cookie:',
          error,
        );
      }
    }

    if (typeof nameOrObj === 'object') {
      const { name, value, ...cookieOptions } = nameOrObj;
      _setCookieWithDocument(name, value, cookieOptions as CookieOptions);
    } else {
      if (typeof valueOrOptions !== 'string') {
        console.warn('[CookieHelper] When using string name, value must be a string');
        return;
      }
      _setCookieWithDocument(nameOrObj, valueOrOptions, options || {});
    }
  }

  /**
   * 获取 cookie
   *
   * @param name - Cookie 名称
   * @returns Cookie 值，不存在返回 undefined
   */
  async get(name: string): Promise<string | undefined> {
    if (!name || typeof name !== 'string') {
      return undefined;
    }

    if (this.useCookieStore && this.cookieStore) {
      try {
        const cookie = await this.cookieStore.get(name);
        return cookie ? cookie.value : undefined;
      } catch (error) {
        console.warn(
          '[CookieHelper] cookieStore.get failed, falling back to document.cookie:',
          error,
        );
      }
    }

    return _getCookieWithDocument(name);
  }

  /**
   * 获取所有 cookie
   *
   * @returns 包含所有 cookie 的对象
   */
  async getAll(): Promise<Record<string, string>> {
    if (this.useCookieStore && this.cookieStore) {
      try {
        const all = await this.cookieStore.getAll();
        const obj: Record<string, string> = {};
        all.forEach((c) => {
          obj[c.name] = c.value;
        });
        return obj;
      } catch (error) {
        console.warn(
          '[CookieHelper] cookieStore.getAll failed, falling back to document.cookie:',
          error,
        );
      }
    }

    return _getAllCookiesWithDocument();
  }

  /**
   * 删除 cookie
   *
   * 注意：需要指定与设置时相同的 path 和 domain 才能正确删除
   *
   * @param name - Cookie 名称
   * @param options - 删除选项（path, domain）
   */
  async delete(name: string, options?: { path?: string; domain?: string }): Promise<void> {
    if (!name || typeof name !== 'string') {
      return;
    }

    if (this.useCookieStore && this.cookieStore) {
      try {
        if (options) {
          await this.cookieStore.delete({
            name,
            ...options,
          });
        } else {
          await this.cookieStore.delete(name);
        }
        return;
      } catch (error) {
        console.warn(
          '[CookieHelper] cookieStore.delete failed, falling back to document.cookie:',
          error,
        );
      }
    }

    _deleteCookieWithDocument(name, options || {});
  }
}

export default new CookieHelper();
