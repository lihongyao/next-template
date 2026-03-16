'use client';

import { useContext, useEffect, useRef } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

// 阻止页面立即打开，先让退场动画走完，再显示新的页面内容
function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
  );
}

const PageAnimatePresence = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    console.log('pathname >>> ', pathname);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initialState"
        animate="animateState"
        variants={{
          exitState: { opacity: 0, x: '100vw' },
        }}
        exit="exitState"
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 min-h-screen w-screen"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimatePresence;
