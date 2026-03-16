'use client';

import { motion } from 'framer-motion';

import { useDevice } from '@/providers/device.provider';

export default function Template({ children }: { children: React.ReactNode }) {
  return children;
  const { isMobile } = useDevice();
  if (!isMobile) return children;
  return (
    <motion.main
      variants={{
        hidden: { opacity: 0, x: 100 },
        enter: { opacity: 1, x: 0 },
      }}
      initial="hidden"
      animate="enter"
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  );
}
