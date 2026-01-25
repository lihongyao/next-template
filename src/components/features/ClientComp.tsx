// src/components/features/ClientComp.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function ClientComp() {
  const t = useTranslations();
  const point = 6000;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div>客户端组件</div>
      <div>{process.env.NEXT_PUBLIC_API_BASE_URL}</div>
      <div className="w-full space-y-2 bg-gray-200 p-4 text-black">
        {/* 1. 没有变量 */}
        <div>{t('title')}</div>
        <div>{t('profile.tips')}</div>

        {/* 2. 存在变量（插值） */}
        <div>{t('profile.reward1', { point })}</div>

        {/* 3. 自定义渲染 */}
        <div>
          {t.rich('profile.reward2', {
            tag: (children) => <span className="font-bold text-red-500">{children}</span>,
            point,
          })}
        </div>
      </div>
    </div>
  );
}
