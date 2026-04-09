/**
 *
 * https://www.npmjs.com/package/liquid-glass-react
 * https://www.liquid-glass.pro/generator.html
 * https://juejin.cn/post/7514618352829448244
 * https://juejin.cn/post/7515390154299818021
 *
 * 优秀案例：
 * https://cheerful-muffin-cbb076.netlify.app/
 *
 * 重要参考：
 * https://kube.io/blog/liquid-glass-css-svg/
 */
'use client';

import React from 'react';

export default function LiquidGlass({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg-wrapper">
      {/* 背景层（必须有！否则没效果） */}
      <div className="lg-bg" />

      {/* 玻璃 */}
      <div className="liquid-glass">
        <div className="glass-text">{children}</div>
      </div>

      {/* SVG filter */}
      <svg width="0" height="0">
        <defs>
          <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.008"
              numOctaves="2"
              seed="2"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
