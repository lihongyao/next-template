// src/components/features/ThemeSkinSwitcher.tsx
'use client';

import { useThemeActions } from '@/hooks/useThemeActions';
import { cn } from '@/libs/class-helpers';
import { useBrandConfig } from '@/providers/brand.provider';

export default function ThemeSkinSwitcher() {
  const { setTheme, setSkin, setLayout } = useThemeActions();
  const { theme, skin, layout } = useBrandConfig();
  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <span>主题切换：</span>
        <button
          className={cn('cursor-pointer', { 'text-[red]': theme === 'modern' })}
          onClick={() => setTheme('modern')}
        >
          Modern
        </button>
        <button
          className={cn('cursor-pointer', { 'text-[red]': theme === 'classic' })}
          onClick={() => setTheme('classic')}
        >
          Classic
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span>皮肤切换：</span>
        <button
          className={cn('cursor-pointer', { 'text-[red]': skin === 'green' })}
          onClick={() => setSkin('green')}
        >
          Green
        </button>
        <button
          className={cn('cursor-pointer', { 'text-[red]': skin === 'blue' })}
          onClick={() => setSkin('blue')}
        >
          Blue
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span>布局切换：</span>
        <button
          className={cn('cursor-pointer', { 'text-[red]': layout === 'top-nav' })}
          onClick={() => setLayout('top-nav')}
        >
          top-nav
        </button>
        <button
          className={cn('cursor-pointer', { 'text-[red]': layout === 'side-nav' })}
          onClick={() => setLayout('side-nav')}
        >
          side-nav
        </button>
      </div>
    </div>
  );
}
