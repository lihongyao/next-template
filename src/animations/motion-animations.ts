import { Variants } from 'framer-motion';

/**
 * 从右到左滑动动画配置
 */

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
      ease: 'linear',
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: 'linear',
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
      ease: 'linear',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: 'linear',
    },
  },
};

export const pageLayoutSlideVariants: Variants = {
  hidden: {
    x: '100%',
  },
  visible: {
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: 'linear',
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: 'linear',
    },
  },
};
