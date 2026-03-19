// src/libs/navigation-direction.ts
'use client';

type Direction = 'forward' | 'back';

let stack: string[] = [];
let index = -1;
let isPopState = false;

export function initNavigation() {
  if (typeof window === 'undefined') return;

  const url = location.pathname + location.search;

  stack = [url];
  index = 0;

  window.addEventListener('popstate', () => {
    isPopState = true;
  });
}

export function resolveDirection(url: string): Direction {
  // 浏览器触发
  if (isPopState) {
    const existing = stack.indexOf(url);

    if (existing !== -1) {
      const dir = existing < index ? 'back' : 'forward';
      index = existing;
      isPopState = false;
      return dir;
    }

    // 极少情况 fallback
    stack.push(url);
    index = stack.length - 1;
    isPopState = false;
    return 'forward';
  }

  // router.push()
  stack = stack.slice(0, index + 1);
  stack.push(url);
  index++;

  return 'forward';
}
