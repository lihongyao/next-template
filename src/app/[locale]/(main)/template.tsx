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
        hidden: { opacity: 0, scale: 0.95 },
        enter: { opacity: 1, scale: 1 },
      }}
      initial="hidden"
      animate="enter"
      transition={{ duration: 0.25, ease: 'linear' }}
    >
      {children}
    </motion.main>
  );
}
