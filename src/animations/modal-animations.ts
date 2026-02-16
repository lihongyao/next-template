import type { Variants } from 'framer-motion';

/**
 * Modal 动画配置
 * 供 RouteModalRenderer 使用，支持 Desktop / Mobile 两种展示方式
 */

/** 动画曲线 */
const EASE_ENTER = [0.32, 0.72, 0, 1] as const;
const EASE_EXIT = [0.25, 1, 0.5, 1] as const;

/** 遮罩层 - Desktop：淡入淡出 */
export const modalBackdropVariantsDesktop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { type: 'tween', duration: 0.2, ease: EASE_EXIT },
  },
};

/** 遮罩层 - Mobile：从右往左滑入，关闭时滑回右侧 */
export const modalBackdropVariantsMobile: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', duration: 0.25, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { type: 'tween', duration: 0.2, ease: EASE_EXIT },
  },
};

/** 内容层 - Desktop：缩放 + 淡入淡出 */
export const modalContentVariantsDesktop: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.3, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    transition: { type: 'tween', duration: 0.25, ease: EASE_EXIT },
  },
};

/** 内容层 - Mobile：从右往左滑入，关闭时滑回右侧 */
export const modalContentVariantsMobile: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'tween', duration: 0.3, ease: EASE_ENTER },
  },
  exit: {
    x: '100%',
    transition: { type: 'tween', duration: 0.3, ease: EASE_EXIT },
  },
};
