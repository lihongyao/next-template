export const MOBILE_MODAL_HISTORY_CHANGE_EVENT = 'app:mobile-modal-history-change';
const ROUTE_MODAL_HISTORY_STATE_KEY = '__routeModal';

export type RouteModalHistoryState = {
  basePathname: string;
  modalPathname: string;
};

type BrowserHistoryState = {
  [ROUTE_MODAL_HISTORY_STATE_KEY]?: RouteModalHistoryState;
};

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
  const currentState = readRouteModalHistoryState();
  const modalPathname = new URL(href, window.location.origin).pathname;
  const state: BrowserHistoryState = {
    [ROUTE_MODAL_HISTORY_STATE_KEY]: {
      basePathname: currentState?.basePathname ?? basePathname,
      modalPathname,
    },
  };

  History.prototype[method].call(window.history, state, '', href);
  notifyMobileModalHistoryChange();
}
