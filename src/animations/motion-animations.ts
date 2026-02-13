import type { Variants } from 'framer-motion';

/**
 * Modal PageTransition共用动画配置
 * 供 Dialog 和 RouteModalRenderer, PageTransition 使用
 */

/** 动画曲线配置 */
const EASE_ENTER = [0.32, 0.72, 0, 1] as const; // 进入  弹窗/页面
const EASE_EXIT = [0.25, 1, 0.5, 1] as const; // 关闭  弹窗 (减速曲线)
const EASE_EXIT_PAGE = [0.32, 0.32, 0.32, 0.32] as const; // 关闭  页面(减速曲线)
const EASE_LINEAR = 'linear' as const; //匀速播放动画

/** 遮罩层动画配置 - 左右滑动（从右往左打开，从左往右关闭） */
export const modalBackdropVariantsRight: Variants = {
  hidden: {
    opacity: 0,
    x: '100%',
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: EASE_ENTER,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: EASE_EXIT,
    },
  },
};

// 从中间开始打开
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: EASE_EXIT,
    },
  },
};

/** Modal 内容层动画配置 */
export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: EASE_ENTER,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: EASE_EXIT,
    },
  },
};

/** 遮罩层过渡配置 */
export const modalBackdropTransition = {
  duration: 0.2,
};

/** Modal 容器过渡配置 */
export const modalContainerTransition = {
  duration: 0.2,
};

/** PageLayout 从右到左滑动动画配置 */
export const pageLayoutSlideVariants: Variants = {
  hidden: {
    x: '100%',
  },
  visible: {
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: EASE_ENTER,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: EASE_EXIT,
    },
  },
};

/** PopupLayout 从下到上滑动动画配置 */
export const popupLayoutSlideVariants: Variants = {
  hidden: {
    y: '100%',
  },
  visible: {
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: EASE_ENTER,
    },
  },
  exit: {
    y: '100%',
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: EASE_EXIT,
    },
  },
};

/** 底部导航切换 Cross Fade 动画配置 */
export const bottomNavCrossFadeVariants: Variants = {
  hidden: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: EASE_ENTER,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: EASE_EXIT_PAGE,
    },
  },
};
