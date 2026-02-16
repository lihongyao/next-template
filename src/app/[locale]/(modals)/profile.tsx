// src/app/[locale]/(modals)/profile.tsx
import { ModalComponentProps } from '@/components/features/RouteModalRenderer';

export default function Profile({ onClose }: ModalComponentProps) {
  return (
    <div
      data-name="Profile"
      className="flex h-screen w-screen flex-col items-center justify-center gap-4 rounded-md bg-white p-3 sm:h-[600px] sm:w-[400px]"
    >
      <h1 className="text-2xl font-bold">个人中心</h1>
      <div className="cursor-pointer hover:text-blue-500" onClick={onClose}>
        返回
      </div>
    </div>
  );
}
