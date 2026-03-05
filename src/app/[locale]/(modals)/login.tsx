'use client';

import { useModal } from '@/providers/modal.provider';

export default function Login() {
  const { onClose } = useModal();
  return (
    <div
      data-name="Login"
      className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white p-3 sm:h-[600px] sm:w-[400px] sm:rounded-md"
    >
      <h1 className="text-2xl font-bold">登录</h1>
      <div className="cursor-pointer hover:text-blue-500" onClick={onClose}>
        返回
      </div>
    </div>
  );
}
