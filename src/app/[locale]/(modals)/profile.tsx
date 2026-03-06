'use client';

import { useModal } from '@/providers/modal.provider';

export default function Profile() {
  const { closeModal } = useModal();
  return (
    <div
      data-name="Profile"
      className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white p-3 sm:rounded-md"
    >
      <h1 className="text-2xl font-bold">个人中心</h1>
      <div className="cursor-pointer hover:text-blue-500" onClick={closeModal}>
        返回
      </div>
    </div>
  );
}
