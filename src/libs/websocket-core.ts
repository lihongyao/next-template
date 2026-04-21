export interface KWebSocketOptions {
  /** 是否启用调试模式，默认 false（主要涉及一些打印日志） */
  debug?: boolean;
  /** WebSocket 连接地址，格式 ws[s]://SERVER_HOST[/path][?query] */
  url: string;
  /** 最大重连次数，默认 5 */
  maxReconnectTimes?: number;
  /** 重连间隔，单位毫秒，默认 10_000 */
  reconnectInterval?: number;
  /** 心跳间隔，单位毫秒，默认 10_000 */
  heartInterval?: number;
  /** 心跳字符串，默认 "heartbeat" */
  heartbeat?: string;
  /** 心跳超时时间，默认 20_000 */
  heartTimeout?: number;
  /** 连接成功回调 */
  onConnected: () => void;
  /** 接收到服务器消息回调 */
  onMessage: (message: string) => void;
  /** 连接关闭回调 */
  onClose?: (event?: CloseEvent) => void;
  /** 连接错误回调 */
  onError?: (event?: Event) => void;
  /** 自定义心跳 */
  customHeartbeat?: () => string;
  /** 实例唯一标识，默认 __DEFAULT__ */
  uniqueKey?: string;
  /** 是否启用自动恢复，默认 true */
  autoRecover?: boolean;
  /** 是否自动连接，默认 true */
  autoConnect?: boolean;
}

export default class KWebSocket {
  /** 配置项 */
  private options: KWebSocketOptions;
  /** WebSocket */
  private socket: WebSocket | null = null;
  /** 重连次数 */
  private reconnectTimes = 0;
  /** 定时器-心跳 */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  /** 定时器-心跳超时检测 */
  private heartbeatCheckTimer: ReturnType<typeof setInterval> | null = null;
  /** 定时器-重连 */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  /** 上次心跳时间 */
  private lastHeartbeatTime: number = 0;
  /** 是否已销毁 */
  private destroyed = false;
  /** 是否手动关闭 */
  private manualCloseFlag = false;
  /** 网络是否离线 */
  private isNetworkOffline = false;
  /** 是否在恢复中 */
  private isRecovering = false;
  /** 所有Socket实例 */
  private static instances: Map<string, KWebSocket> = new Map();
  /** 网络恢复自动重连事件句柄 */
  private recoverHandler: (() => void) | undefined;
  /** 网络离线事件句柄 */
  private offlineHandler: (() => void) | undefined;

  /** 与 getInstance 使用同一规则，避免 uniqueKey 为 "" 时与 Map 键不一致 */
  private static normalizeInstanceKey(uniqueKey?: string): string {
    return uniqueKey || '__DEFAULT__';
  }

  private _instanceKey(): string {
    return KWebSocket.normalizeInstanceKey(this.options.uniqueKey);
  }

  /**
   * 获取实例，单例模式
   * @param options 配置项
   * @returns
   */
  public static getInstance(options: KWebSocketOptions): KWebSocket {
    const key = KWebSocket.normalizeInstanceKey(options.uniqueKey);
    const existing = KWebSocket.instances.get(key);
    if (existing) {
      existing._tips(`KWebSocket：实例 [${key}] 已存在，合并配置并返回现有实例`);
      existing.options = { ...existing.options, ...options };
      return existing;
    }
    const instance = new KWebSocket(options);
    KWebSocket.instances.set(key, instance);
    return instance;
  }

  /**
   * 类方法关闭并销毁
   * @param uniqueKey 实例 key
   */
  public static close(uniqueKey?: string) {
    if (uniqueKey !== undefined) {
      const key = KWebSocket.normalizeInstanceKey(uniqueKey);
      const inst = KWebSocket.instances.get(key);
      if (inst) {
        inst._destroy();
        KWebSocket.instances.delete(key);
      }
    } else {
      for (const inst of KWebSocket.instances.values()) {
        inst._destroy();
      }
      KWebSocket.instances.clear();
    }
  }

  /**
   * 列出当前实例 key
   * @returns
   */
  public static listInstances() {
    return Array.from(KWebSocket.instances.keys());
  }

  /**
   * 构造函数
   * @param options
   */
  private constructor(options: KWebSocketOptions) {
    // 1. 默认配置
    const defaults = {
      debug: false,
      maxReconnectTimes: 5,
      reconnectInterval: 10_000,
      heartInterval: 10_000,
      heartbeat: 'heartbeat',
      heartTimeout: 20_000,
      uniqueKey: '__DEFAULT__',
      autoRecover: true,
      autoConnect: true,
    };
    // 2. 合并配置
    this.options = { ...defaults, ...options };
    // 3. 绑定网络恢复自动重连
    this._bindAutoRecover();
    // 4. 根据 autoConnect 决定是否立即连接
    if (this.options.autoConnect) this.connect();
  }

  /** 主动连接接口 */
  public connect() {
    if (this.destroyed) return;
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) return;
    this.manualCloseFlag = false;
    this._init();
  }

  /** 主动断开接口（不会销毁实例，可再次调用 connect） */
  public disconnect() {
    if (this.destroyed || !this.socket) return;
    this.manualCloseFlag = true; // 标记为主动断开
    this.isRecovering = false;
    this._closeSocket();
  }

  /**
   * 实例方法关闭并销毁（手动关闭）
   */
  public close() {
    if (this.destroyed) return;
    this.manualCloseFlag = true;
    this._destroy();
    KWebSocket.instances.delete(this._instanceKey());
  }

  /**
   * 安全重新初始化连接
   * @param newUrl 新的 WebSocket 地址
   */
  public reinitialize(newUrl: string) {
    if (this.destroyed) {
      this._tips('WebSocket：实例已销毁，无法重新初始化连接', 'warn');
      return;
    }
    if (!newUrl) {
      this._tips('WebSocket：reinitialize 传入的 newUrl 为空', 'warn');
      return;
    }
    if (this.options.url === newUrl) {
      this._tips('WebSocket：新旧 URL 相同，跳过重新初始化连接');
      return;
    }

    this._tips(`WebSocket：重新初始化连接 URL 为 ${newUrl}，准备重连`);

    // 阻止旧 socket 触发重连
    this.manualCloseFlag = true;

    // 清理所有定时器，包括旧的重连定时器
    this._clearTimers();

    // 监听旧 socket 完全关闭再初始化新连接
    const initNew = () => {
      // 更新 URL
      this.options.url = newUrl;
      // 重置状态
      this.reconnectTimes = 0;
      this.isRecovering = false;
      // 解锁手动关闭标志，新连接可以正常触发心跳和重连
      this.manualCloseFlag = false;
      // 建立新连接
      this._init();
    };

    // 如果旧 socket 已关闭，直接初始化
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      initNew();
    } else {
      // 旧 socket 未关闭，则监听 onclose 后初始化（仍通知 onClose，与 _watch 行为一致）
      this.socket.onclose = (event) => {
        this._tips('WebSocket：旧连接已关闭，开始新连接');
        this.options.onClose?.(event);
        initNew();
      };
      this.socket.close();
    }
  }

  /**
   * 初始化 WebSocket
   */
  private _init() {
    this.socket = new WebSocket(this.options.url);
    this.lastHeartbeatTime = Date.now();
    this._watch();
  }

  /**
   * 监听WebSocket事件
   */
  private _watch() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this._tips('WebSocket：连接打开');
      this.options.onConnected();
      this.reconnectTimes = 0;
      this.lastHeartbeatTime = Date.now();
      this.sendHeartbeat();
      this.startHeartbeatCheck();
    };

    this.socket.onmessage = (event) => {
      this.lastHeartbeatTime = Date.now();
      this._tips(`WebSocket：接收到消息：${event.data}`);
      this.options.onMessage(event.data);
    };

    this.socket.onclose = (event) => {
      this._clearTimers();
      this.options.onClose?.(event);
      this._tips('WebSocket：连接断开');
      if (!this.manualCloseFlag && this.reconnectTimes < this.options.maxReconnectTimes!)
        this._reconnect(false);
    };

    this.socket.onerror = (event) => {
      this._tips(`WebSocket Error: ${event}`, 'error');
      this.options.onError?.(event);
    };
  }

  /**
   * 发送消息
   */
  public send(data: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this._tips('WebSocket：无法发送消息，连接未打开', 'warn');
      return;
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (payload === undefined) {
      this._tips('WebSocket：无法序列化消息（undefined）', 'warn');
      return;
    }
    this.socket.send(payload);
    this._tips(`WebSocket：发送消息：${payload}`);
  }

  /**
   * 心跳发送
   */
  private sendHeartbeat() {
    if (this.heartbeatTimer) return;
    // 定时发送心跳
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send((this.options.customHeartbeat?.() || this.options.heartbeat)!);
        this.lastHeartbeatTime = Date.now();
        this._tips('WebSocket：💓 心跳发送');
      }
    }, this.options.heartInterval);

    // 立即发送一次
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send((this.options.customHeartbeat?.() || this.options.heartbeat)!);
      this.lastHeartbeatTime = Date.now();
      this._tips('WebSocket：💓 心跳发送');
    }
  }

  /**
   * 心跳超时检测（强制断开假连接）
   */
  private startHeartbeatCheck() {
    this.stopHeartbeatCheck();
    this.heartbeatCheckTimer = setInterval(() => {
      const diff = Date.now() - this.lastHeartbeatTime;
      if (diff > this.options.heartTimeout!) {
        this._tips(
          `WebSocket：心跳超时，强制关闭并重连，心跳间隔为 ${this.options.heartInterval} ms`,
          'warn',
        );
        this._reconnect(false);
      }
    }, this.options.heartInterval);
  }

  /**
   * 停止心跳超时检测
   */
  private stopHeartbeatCheck() {
    if (this.heartbeatCheckTimer) clearInterval(this.heartbeatCheckTimer);
    this.heartbeatCheckTimer = null;
  }

  /**
   * 关闭 socket 并尝试重连 / 强制重连
   * @param force 是否不受 maxReconnectTimes 限制
   */
  private _reconnect(force: boolean) {
    if (this.manualCloseFlag) {
      if (force) this.isRecovering = false;
      return;
    }
    this._closeSocket();
    if (!force) this.reconnectTimes++;
    if (force || this.reconnectTimes <= this.options.maxReconnectTimes!) {
      const delay = this.options.reconnectInterval;
      this._tips(`WebSocket：尝试第 ${this.reconnectTimes} 次重连${force ? '（强制）' : ''}`);
      this.reconnectTimer = setTimeout(() => {
        if (force) this.isRecovering = false;
        if (this.manualCloseFlag) return;
        this._init();
      }, delay);
    } else {
      this._tips('WebSocket：已达到最大重连次数，不再重连', 'warn');
    }
  }

  /**
   * 绑定网络恢复自动重连
   */
  private _bindAutoRecover() {
    if (!this.options.autoRecover || typeof window === 'undefined') return;

    // 绑定 offline
    this.offlineHandler = () => {
      this.isNetworkOffline = true;
      this._tips('WebSocket：检测到网络断开', 'warn');
    };
    window.addEventListener('offline', this.offlineHandler);

    // 绑定 online
    this.recoverHandler = () => {
      if (this.manualCloseFlag || !this.isNetworkOffline) return;
      this.isNetworkOffline = false;
      this.reconnectTimes = 0;
      this._tips('WebSocket：网络恢复，已重置重连次数为 0');

      const diff = Date.now() - this.lastHeartbeatTime;
      if (
        !this.socket ||
        this.socket.readyState === WebSocket.CLOSED ||
        diff > this.options.heartTimeout!
      ) {
        if (!this.isRecovering) {
          this.isRecovering = true;
          this._tips('WebSocket：网络恢复，检测到心跳失效，尝试重连');
          this._reconnect(true);
        }
      } else {
        this._tips('WebSocket：网络恢复但心跳仍活跃，无需重连');
      }
    };
    window.addEventListener('online', this.recoverHandler);
  }

  /**
   * 销毁实例
   */
  private _destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.isRecovering = false;
    this._closeSocket();

    if (typeof window !== 'undefined') {
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler);
        this.offlineHandler = undefined;
      }
      if (this.recoverHandler) {
        window.removeEventListener('online', this.recoverHandler);
        this.recoverHandler = undefined;
      }
    }
    this._tips('WebSocket：已销毁');
  }

  /**
   * 关闭 socket，不触发重连
   */
  private _closeSocket() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
    }
    this._clearTimers();
  }

  /**
   * 清理所有定时器
   */
  private _clearTimers() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.heartbeatCheckTimer) clearInterval(this.heartbeatCheckTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.heartbeatTimer = null;
    this.heartbeatCheckTimer = null;
    this.reconnectTimer = null;
  }

  /**
   * 根据是否启用调试模式打印日志
   */
  private _tips(msg: string, type: 'log' | 'warn' | 'error' = 'log') {
    if (this.options.debug) console[type](msg);
  }
}
