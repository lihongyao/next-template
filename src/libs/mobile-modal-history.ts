export const MOBILE_MODAL_HISTORY_CHANGE_EVENT = 'app:mobile-modal-history-change';
const ROUTE_MODAL_HISTORY_STATE_KEY = '__routeModal';
const ROUTE_MODAL_PAGE_TRANSITION_TTL = 5000;

let routeModalPageTransitionPathname: string | null = null;
// 普通页入场时仍要把当前 modal 留在下层，避免页面滑入期间透出更底层的一级页。
let routeModalPageTransitionModalPathname: string | null = null;
let routeModalPageTransitionStartedAt = 0;

export type RouteModalHistoryState = {
  basePathname: string;
  modalPathname: string;
};

type BrowserHistoryState = {
  [ROUTE_MODAL_HISTORY_STATE_KEY]?: RouteModalHistoryState;
};

function normalizePathname(href: string): string {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split(/[?#]/)[0] || '/';
  }
}

function getCurrentHistoryState(): BrowserHistoryState {
  return window.history.state && typeof window.history.state === 'object'
    ? { ...window.history.state }
    : {};
}

export function notifyMobileModalHistoryChange(): void {
  window.dispatchEvent(new Event(MOBILE_MODAL_HISTORY_CHANGE_EVENT));
}

export function readRouteModalHistoryState(state: unknown = window.history.state) {
  if (!state || typeof state !== 'object') return null;
  const value = (state as BrowserHistoryState)[ROUTE_MODAL_HISTORY_STATE_KEY];
  if (!value || typeof value !== 'object') return null;
  if (typeof value.basePathname !== 'string' || typeof value.modalPathname !== 'string') {
    return null;
  }
  return value;
}

export function isRouteModalHistoryEntry(): boolean {
  return readRouteModalHistoryState() !== null;
}

export function writeRouteModalHistoryEntry({
  method,
  href,
  basePathname,
}: {
  method: 'pushState' | 'replaceState';
  href: string;
  basePathname: string;
}): void {
  const historyState = getCurrentHistoryState();
  const currentState = readRouteModalHistoryState(historyState);
  const modalPathname = normalizePathname(href);
  const state: BrowserHistoryState = {
    ...historyState,
    [ROUTE_MODAL_HISTORY_STATE_KEY]: {
      basePathname: currentState?.basePathname ?? basePathname,
      modalPathname,
    },
  };

  History.prototype[method].call(window.history, state, '', href);
  notifyMobileModalHistoryChange();
}

export function startRouteModalPageTransition(href: string, modalPathname?: string): void {
  routeModalPageTransitionPathname = normalizePathname(href);
  routeModalPageTransitionModalPathname = modalPathname ? normalizePathname(modalPathname) : null;
  routeModalPageTransitionStartedAt = Date.now();
}

export function finishRouteModalPageTransition(pathname?: string): void {
  if (
    pathname &&
    routeModalPageTransitionPathname &&
    normalizePathname(pathname) !== routeModalPageTransitionPathname
  ) {
    return;
  }

  routeModalPageTransitionPathname = null;
  routeModalPageTransitionModalPathname = null;
  routeModalPageTransitionStartedAt = 0;
}

export function getRouteModalPageTransitionModalPathname(pathname: string): string | null {
  return isRouteModalPageTransitionTarget(pathname) ? routeModalPageTransitionModalPathname : null;
}

export function isRouteModalPageTransitionTarget(pathname: string): boolean {
  if (!routeModalPageTransitionPathname) return false;
  if (Date.now() - routeModalPageTransitionStartedAt > ROUTE_MODAL_PAGE_TRANSITION_TTL) {
    finishRouteModalPageTransition();
    return false;
  }

  return normalizePathname(pathname) === routeModalPageTransitionPathname;
}
