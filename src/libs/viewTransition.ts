// src/libs/viewTransition.ts

const DURATION = 250;
const EASING = 'linear';

export type ViewTransitionDirection = 'forward' | 'backward';

let nextDirection: ViewTransitionDirection = 'forward';
let skipNextTransition = false;

// iOS edge swipe 状态
let startX = 0;
let startY = 0;
let swiping = false;

const EDGE = 30;
const DISTANCE = 50;

function installSwipeDetection() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isIOS) return;

  window.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      swiping = false;
    },
    { passive: true },
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);

      if (startX < EDGE && dx > DISTANCE && dx > dy) {
        swiping = true;
      }
    },
    { passive: true },
  );

  window.addEventListener(
    'touchend',
    () => {
      if (swiping) {
        skipNextTransition = true;
      }
    },
    true,
  );
}

// forward 动画
function runForward() {
  const root = document.documentElement;
  root.style.setProperty('--vt-new-z', '2');
  root.style.setProperty('--vt-old-z', '1');

  root.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-old(root)',
  });

  root.animate(
    [
      { opacity: 0.8, transform: 'translate3d(100vw,0,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' },
    ],
    {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  );
}

// backward 动画
function runBackward() {
  const root = document.documentElement;
  root.style.setProperty('--vt-new-z', '1');
  root.style.setProperty('--vt-old-z', '2');

  root.animate(
    [
      { opacity: 1, transform: 'translate3d(0,0,0)' },
      { opacity: 0, transform: 'translate3d(100vw,0,0)' },
    ],
    {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)',
    },
  );

  root.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-new(root)',
  });
}

function pageAnimation(direction: ViewTransitionDirection) {
  if (direction === 'backward') runBackward();
  else runForward();
}

/**
 * 安装全局 ViewTransition patch（Next.js 安全版本）
 */
export function installViewTransitionPatch() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  installSwipeDetection();

  if (!('startViewTransition' in document)) return;

  const originalStartViewTransition = document.startViewTransition.bind(document);

  (
    document as Document & { startViewTransition: typeof originalStartViewTransition }
  ).startViewTransition = function (callback: () => void | Promise<void>) {
    const direction = nextDirection;
    nextDirection = 'forward';

    // iOS edge swipe，直接执行 callback，避免伪元素产生和闪烁
    if (skipNextTransition) {
      skipNextTransition = false;
      return Promise.resolve().then(callback) as any;
    }

    const transition = originalStartViewTransition(callback);

    transition.ready.then(() => {
      pageAnimation(direction);
    });

    return transition;
  };

  window.addEventListener(
    'popstate',
    () => {
      nextDirection = 'backward';
    },
    true,
  );
}
