import type { Variants } from 'framer-motion';

/**
 * Modal 动画配置
 * 供 RouteModalRenderer 使用，支持 Desktop / Mobile 两种展示方式
 */

/** 遮罩层 - Desktop：淡入淡出 */
export const modalBackdropVariantsDesktop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
};

/** 遮罩层 - Mobile：从右往左滑入，关闭时滑回右侧 */
export const modalBackdropVariantsMobile: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
};

/** 内容层 - Desktop：缩放 + 淡入淡出 */
export const modalContentVariantsDesktop: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    transition: { type: 'tween', duration: 0.25, ease: 'linear' },
  },
};

/** 内容层 - Mobile：从右往左滑入，关闭时滑回右侧 */
export const modalContentVariantsMobile: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
  exit: {
    x: '100%',
    transition: { type: 'tween', duration: 0.2, ease: 'linear' },
  },
};

/** 遮罩层 - Mobile Bottom Sheet：淡入淡出 */
export const modalBackdropVariantsMobileVertical: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: 'tween', duration: 0.16, ease: 'linear' },
  },
  exit: {
    opacity: 0,
    transition: { type: 'tween', duration: 0.16, ease: 'linear' },
  },
};

/** 内容层 - Mobile Bottom Sheet：从下往上进入，关闭时向下退出 */
export const modalContentVariantsMobileVertical: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'tween', duration: 0.18, ease: 'linear' },
  },
  exit: {
    y: '100%',
    transition: { type: 'tween', duration: 0.18, ease: 'linear' },
  },
};
