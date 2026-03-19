'use client';

type Direction = 'forward' | 'back';

let stack: string[] = [];
let index = -1;
let pendingDirection: Direction = 'forward';

export function initNavigation() {
  const url = location.pathname + location.search;

  stack = [url];
  index = 0;

  window.addEventListener('popstate', () => {
    const nextUrl = location.pathname + location.search;
    const existing = stack.indexOf(nextUrl);

    if (existing !== -1) {
      pendingDirection = existing < index ? 'back' : 'forward';
      index = existing;
    } else {
      pendingDirection = 'back';
    }
  });
}

/**
 * push 时调用（只调用一次）
 */
export function markForward(url: string) {
  stack = stack.slice(0, index + 1);
  stack.push(url);
  index++;
  pendingDirection = 'forward';
}

/**
 * layout 只读取，不计算
 */
export function consumeDirection(): Direction {
  return pendingDirection;
}
