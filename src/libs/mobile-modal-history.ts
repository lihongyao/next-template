export const MOBILE_MODAL_HISTORY_CHANGE_EVENT = 'app:mobile-modal-history-change';

export function notifyMobileModalHistoryChange(): void {
  window.dispatchEvent(new Event(MOBILE_MODAL_HISTORY_CHANGE_EVENT));
}
