'use client';

/**
 * 路由方向判定（给 framer-motion 用）
 *
 * 规则很简单：
 * 1) 先吃浏览器原生索引（Navigation API / history.state.idx）
 * 2) Safari 或拿不到索引时，用本地 url 栈兜底
 * 3) 业务侧 push/back/replace 会主动打标，避免方向抖动
 *
 * 这个文件只维护一个可消费方向（pendingDirection），
 * layout 渲染时读它，不在 layout 里再做方向计算。
 */
type Direction = 'forward' | 'back';

let pendingDirection: Direction = 'forward';
let initialized = false;
let currentHistoryIdx = 0;
let currentNavigationIndex = 0;
let hasNavigationApi = false;
let enableUrlStackFallback = false;
let urlStack: string[] = [];
let urlIndex = 0;

// Safari 在部分场景下索引信号不稳定，保留兜底分支
function isSafariLikeBrowser(): boolean {
  const ua = navigator.userAgent;
  const isSafari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|CriOS\/|Edg\//.test(ua);
  return isSafari;
}

function currentUrl(): string {
  return window.location.pathname + window.location.search;
}

// 把绝对/相对地址统一成 pathname + search，便于进栈比较
function normalizeUrl(url: string): string {
  try {
    const resolved = new URL(url, window.location.origin);
    return resolved.pathname + resolved.search;
  } catch {
    return url;
  }
}

function readHistoryIdx(state: unknown): number | null {
  if (!state || typeof state !== 'object') return null;
  const candidate = (state as { idx?: unknown }).idx;
  return typeof candidate === 'number' ? candidate : null;
}

function readNavigationIndex(): number | null {
  const nav = (window as unknown as { navigation?: { currentEntry?: { index?: number } } })
    .navigation;
  const candidate = nav?.currentEntry?.index;
  return typeof candidate === 'number' ? candidate : null;
}

// 同步当前已知索引，减少后续判向误差
function syncKnownIndices() {
  const historyIdx = readHistoryIdx(window.history.state);
  if (historyIdx !== null) currentHistoryIdx = historyIdx;
  if (hasNavigationApi) {
    const navIdx = readNavigationIndex();
    if (navIdx !== null) currentNavigationIndex = navIdx;
  }
}

function setDirectionByNumericIndex(nextIndex: number, currentIndex: number): void {
  pendingDirection = nextIndex < currentIndex ? 'back' : 'forward';
}

// 在 url 栈里找目标地址，找到就能判定前进/后退
function tryResolveDirectionByUrlStack(nextUrl: string): boolean {
  const existing = urlStack.lastIndexOf(nextUrl);
  if (existing === -1) return false;
  pendingDirection = existing < urlIndex ? 'back' : 'forward';
  urlIndex = existing;
  return true;
}

export function initNavigation() {
  if (initialized) return;
  initialized = true;
  currentHistoryIdx = readHistoryIdx(window.history.state) ?? 0;
  currentNavigationIndex = readNavigationIndex() ?? 0;
  hasNavigationApi = readNavigationIndex() !== null;
  enableUrlStackFallback = isSafariLikeBrowser() || !hasNavigationApi;
  urlStack = [currentUrl()];
  urlIndex = 0;

  // 主通道：Navigation API（有就用）
  if (hasNavigationApi) {
    const nav = (
      window as unknown as {
        navigation?: {
          addEventListener?: (
            type: string,
            listener: (event: { navigationType?: string }) => void,
          ) => void;
        };
      }
    ).navigation;
    nav?.addEventListener?.('currententrychange', (event) => {
      const type = event.navigationType;
      const nextNavIdx = readNavigationIndex();
      if (type === 'traverse' && nextNavIdx !== null) {
        setDirectionByNumericIndex(nextNavIdx, currentNavigationIndex);
        currentNavigationIndex = nextNavIdx;
        syncKnownIndices();
        return;
      }
      // push/replace/reload 不改方向，只同步索引
      syncKnownIndices();
    });
  }

  // 浏览器按钮：先走 history idx，拿不到再走 url 栈兜底
  window.addEventListener('popstate', (event) => {
    const nextIdx = readHistoryIdx(event.state) ?? readHistoryIdx(window.history.state);
    if (nextIdx !== null) {
      setDirectionByNumericIndex(nextIdx, currentHistoryIdx);
      currentHistoryIdx = nextIdx;
      syncKnownIndices();
      return;
    }

    if (enableUrlStackFallback && tryResolveDirectionByUrlStack(currentUrl())) {
      return;
    }
    // 实在判不出时保守用 back，宁可慢也别反向
    pendingDirection = 'back';
  });
}

/**
 * push 时调用（只调用一次）
 */
export function markForward(_url?: string) {
  pendingDirection = 'forward';
  if (_url) {
    const nextUrl = normalizeUrl(_url);
    // push 语义：截断“前进分支”后再入栈
    if (urlStack[urlIndex] !== nextUrl) {
      urlStack = urlStack.slice(0, urlIndex + 1);
      urlStack.push(nextUrl);
      urlIndex = urlStack.length - 1;
    }
  }
  queueMicrotask(syncKnownIndices);
}

export function markBack() {
  pendingDirection = 'back';
  queueMicrotask(syncKnownIndices);
}

export function markReplace(url: string) {
  pendingDirection = 'forward';
  const nextUrl = normalizeUrl(url);
  // replace 不扩栈，只替换当前指针位置
  urlStack[urlIndex] = nextUrl;
  queueMicrotask(syncKnownIndices);
}

/**
 * layout 只读取，不计算
 */
export function consumeDirection(): Direction {
  return pendingDirection;
}
