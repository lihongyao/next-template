const DURATION = 250;
const EASING = 'linear';

/** 前进：旧页向左离开，新页从右侧滑入 */
function runForward() {
  document.documentElement.style.setProperty('--vt-new-z', '2');
  document.documentElement.style.setProperty('--vt-old-z', '1');
  // document.documentElement.animate(
  //   // [{ transform: 'translateX(0)' }, { transform: 'translateX(-100px)' }],
  //   {
  //     duration: DURATION,
  //     easing: 'linear',
  //     fill: 'forwards',
  //     pseudoElement: '::view-transition-old(root)',
  //   },
  // );
  document.documentElement.animate(
    [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
    {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  );
}

/** 返回：旧页向右滑出（与进入方向相反），新页从左侧滑入 */
function runBackward() {
  document.documentElement.style.setProperty('--vt-new-z', '1');
  document.documentElement.style.setProperty('--vt-old-z', '2');
  document.documentElement.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
    {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)',
    },
  );
  document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
    pseudoElement: '::view-transition-new(root)',
  });
}

export type ViewTransitionDirection = 'forward' | 'backward';

export function pageAnimation(direction: ViewTransitionDirection = 'forward') {
  if (direction === 'backward') {
    runBackward();
  } else {
    runForward();
  }
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
      console.log('xxxx');
      nextDirection = 'backward';
    },
    true,
  );
}
