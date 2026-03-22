'use client';

import { motion } from 'framer-motion';

import { useDevice } from '@/providers/device.provider';

export default function Template({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDevice();
  if (!isMobile) return children;
  return (
    <motion.main
      variants={{
        hidden: { opacity: 0.4, translateY: 10 },
        enter: { opacity: 1, translateY: 0 },
      }}
      initial="hidden"
      animate="enter"
      transition={{ duration: 0.2, ease: 'easeIn' }}
    >
      {children}
    </motion.main>
  );
}
