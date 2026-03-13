const DURATION = 250;
const EASING = 'linear';

export type ViewTransitionDirection = 'forward' | 'backward';

function runForward() {
  const root = document.documentElement;

  root.style.setProperty('--vt-new-z', '2');
  root.style.setProperty('--vt-old-z', '1');

  // root.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-30%)' }], {
  //   duration: DURATION,
  //   easing: EASING,
  //   fill: 'forwards',
  //   pseudoElement: '::view-transition-old(root)',
  // });

  root.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-new(root)',
  });
}

function runBackward() {
  const root = document.documentElement;

  root.style.setProperty('--vt-new-z', '1');
  root.style.setProperty('--vt-old-z', '2');

  root.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-old(root)',
  });

  root.animate([{ transform: 'translateX(-30%)' }, { transform: 'translateX(0)' }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-new(root)',
  });
}

export function pageAnimation(direction: ViewTransitionDirection) {
  if (direction === 'backward') runBackward();
  else runForward();
}

let nextDirection: ViewTransitionDirection = 'forward';

/**
 * 安装全局 View Transition 补丁：使每次转场（含浏览器后退）都执行方向感知动画。
 * 在 ClientInitializer 中调用一次即可。
 */
export function installViewTransitionPatch() {
  if (typeof document === 'undefined' || !('startViewTransition' in document)) return;

  const originalStartViewTransition = document.startViewTransition.bind(document);
  (
    document as Document & { startViewTransition: typeof originalStartViewTransition }
  ).startViewTransition = function (callback: () => void | Promise<void>) {
    const direction = nextDirection;
    nextDirection = 'forward';
    const transition = originalStartViewTransition(callback);
    transition.ready.then(() => pageAnimation(direction));
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
