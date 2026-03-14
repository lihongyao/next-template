'use client';

import { useEffect } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { usePathname } from '@/i18n/navigation';

import FrozenRoute from './FrozenRoute';

let count = 1;

const tabContentAnimation = {
  initial: { opacity: 0.5, x: '100%' },
  animate: { opacity: 1, x: '0%' },
  exit: { opacity: 0.5, scale: '100%' },
};

const tabContentTransition = {
  duration: 0.2,
  ease: 'linear',
};

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return children;
  const pathname = usePathname();

  useEffect(() => {
    count++;
    console.log(history.length);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={tabContentAnimation}
        transition={tabContentTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          willChange: 'transform, opacity',
          transformOrigin: 'center top',
        }}

        // initial={count % 2 === 0 ? { x: '100%' } : { x: '0%' }}
        // animate={{ x: '0%' }}
        // transition={{ type: 'tween', duration: 0.25, ease: 'linear' }}
        // exit={count % 2 === 0 ? { x: '100%' } : { x: '0%' }}
        // style={{
        //   willChange: 'transform, opacity',
        //   transformOrigin: 'center top',
        // }}
      >
        <FrozenRoute>{children}</FrozenRoute>
      </motion.div>
    </AnimatePresence>
  );
}
