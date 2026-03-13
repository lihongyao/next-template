'use client';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return children;
  // const pathname = usePathname();
  // return (
  //   <AnimatePresence mode="wait">
  //     <motion.div
  //       key={pathname}
  //       initial={{ x: '100%' }}
  //       animate={{ x: 0 }}
  //       transition={{ type: 'tween', duration: 0.25, ease: 'linear' }}
  //     >
  //       <FrozenRoute>{children}</FrozenRoute>
  //     </motion.div>
  //   </AnimatePresence>
  // );
}
