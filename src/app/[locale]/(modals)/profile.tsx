'use client';

import { useModal } from '@/providers/modal.provider';

export default function Profile() {
  const { closeModal } = useModal();
  return (
    <div
      data-name="Profile"
      className="flex h-[600px] w-[400px] flex-col items-center justify-center gap-4 rounded-md bg-white p-3"
    >
      <h1 className="text-2xl font-bold">个人中心</h1>
      <div className="cursor-pointer hover:text-blue-500" onClick={closeModal}>
        返回
      </div>
    </div>
  );
}
