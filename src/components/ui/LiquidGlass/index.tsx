/**
 * https://juejin.cn/post/7514618352829448244
 * https://www.npmjs.com/package/liquid-glass-react
 * https://kube.io/blog/liquid-glass-css-svg/
 * https://juejin.cn/post/7514618352829448244
 * https://www.liquid-glass.pro/generator.html
 * https://juejin.cn/post/7515390154299818021?searchId=20260317182921FF9FB8D661A6C66D26C1
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
