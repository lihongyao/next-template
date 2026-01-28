// src/app/[locale]/(modals)/profile.tsx
'use client';
import type { ModalComponentProps } from '@/components/features/RouteModalRenderer';

export default function Profile({ onCloseAction }: ModalComponentProps) {
  return (
    <div
      data-name="Profile"
      className="flex h-[100px] w-[300px] flex-col items-center justify-center gap-2 rounded-lg bg-white"
    >
      <div>个人中心</div>
      <button onClick={onCloseAction}>关闭</button>
    </div>
  );
}
