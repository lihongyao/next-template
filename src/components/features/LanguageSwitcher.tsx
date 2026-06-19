// src/components/features/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';

import { useLocale } from 'next-intl';

import { clsx } from '@/libs/class-helpers';
import { usePathname, useRouter } from '@/router';

/**
 * LanguageSwitcher 组件
 *
 * 功能：
 * - 显示可用语言列表，每个按钮带国旗
 * - 当前选中语言高亮
 * - 点击按钮切换语言，使用 router.replace 替换当前 URL，不增加历史记录
 *
 * 数据依赖：
 * - routing.locales: 项目支持的语言列表
 * - routing.defaultLocale: 默认语言
 *
 * 用法：
 * <LanguageSwitcher />
 *
 * 备注：
 * - 使用了 clsx 工具函数来处理 Tailwind 类名动态拼接
 */

// 语言列表直接包含国旗
const langs = [
  { code: 'zh-CN', label: '🇨🇳 Chinese' },
  { code: 'en-US', label: '🇺🇸 English' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'es', label: '🇪🇸 Español' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const [loading, setLoading] = useState(false);

  const onSwitchLocale = (locale: string) => {
    if (loading) return;
    if (locale === currentLocale) return;
    setLoading(true);
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex items-center gap-2">
      {langs.map((locale) => {
        const isActive = locale.code === currentLocale;
        return (
          <button
            key={locale.code}
            type="button"
            onClick={() => onSwitchLocale(locale.code)}
            className={clsx(
              'cursor-pointer rounded border px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
            )}
          >
            {locale.label}
          </button>
        );
      })}
    </div>
  );
}
