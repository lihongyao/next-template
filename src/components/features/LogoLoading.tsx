'use client';

import { useEffect, useState } from 'react';

export default function LogoLoading() {
  const duration = 500; // 动画持续时间（毫秒）

  const [loading, setLoading] = useState(false);
  const [animateStyle, setAnimateStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // fadeOut 动画（3秒）
    setAnimateStyle({
      animation: 'logo-loading__fadeOut 3s forwards',
    });

    const timer = setTimeout(() => {
      setLoading(true);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;
  return null;

  return (
    <>
      <style>{`
        @keyframes logo-loading__fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes logo-loading__fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          zIndex: 99999,
          inset: 0,
          display: 'flex',
          height: '100%',
          maxWidth: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          //
          /**
           * 替换为主题色
           * IOS会认为第一屏出现的内容颜色就是主题色，并将这个主题色应用到系统状态栏等位置，所以这里需要和主题色保持一致
           */
          backgroundColor: '#161616',
        }}
      >
        <div
          style={{
            height: '77px',
            ...animateStyle,
          }}
        >
          <img
            style={{ height: '100%' }}
            src={`/res/${process.env.NEXT_PUBLIC_BRAND}/logo.png`}
            alt="logo"
          />
        </div>
      </div>
    </>
  );
}
