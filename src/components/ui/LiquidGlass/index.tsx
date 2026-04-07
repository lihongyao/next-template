/**
 * https://juejin.cn/post/7514618352829448244
 * https://www.npmjs.com/package/liquid-glass-react
 */
import { cn } from '@/libs/class-helpers';

import './index.css';

export default function LiquidGlass({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-name="LiquidGlass" className={cn('liquid-glass relative', className)}>
      <div className="glass-layer" />
      <div className="glass-highlight" />
      <div className="glass-content">{children}</div>
    </div>
  );
}
