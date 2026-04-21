'use client';

import { useModal } from '@/providers/modal.provider';

export default function Login() {
  const { closeModal } = useModal();
  return (
    <div
      data-name="Login"
      className="flex h-screen w-screen items-center justify-center gap-4 bg-white sm:h-[600px] sm:w-[800px] sm:overflow-hidden sm:rounded-lg"
    >
      <div className="h-full flex-1 bg-amber-600"></div>
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="cursor-pointer hover:text-blue-500" onClick={closeModal}>
          返回
        </div>
      </div>
    </div>
  );
}
