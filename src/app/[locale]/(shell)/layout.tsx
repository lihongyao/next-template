'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useSwipeBack } from '@/hooks/useSwipeBack';
import { usePathname } from '@/i18n/navigation';
import { useGlobalStore } from '@/stores/useGlobalStore';

import FrozenRoute from './FrozenRoute';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const direction = useGlobalStore((s) => s.direction);
  const [isAllow, setIsAllow] = useState(true);
  useSwipeBack((value) => setIsAllow(!value), { enabled: true });
  return (
    <AnimatePresence mode="popLayout" initial={isAllow}>
      <motion.div
        key={pathname}
        initial={isAllow ? (direction === 'forward' ? { x: '100%' } : { x: '-100%' }) : undefined}
        animate={isAllow ? { x: 0 } : undefined}
        exit={isAllow ? (direction === 'forward' ? { x: '-100%' } : { x: '100%' }) : undefined}
        // transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        transition={{ type: 'tween', duration: 0.25, ease: 'linear' }}
        style={{ willChange: 'transform, opacity' }}
      >
        <FrozenRoute>{children}</FrozenRoute>
      </motion.div>
    </AnimatePresence>
  );
}
