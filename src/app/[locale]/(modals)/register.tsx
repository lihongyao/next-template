'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ModalComponentProps } from '@/components/features/RouteModalRenderer';
import { RegisterFormValues, registerSchema } from '@/schemas/user.schema';

export default function Register({ onClose }: ModalComponentProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log(data);
  };

  return (
    <div
      data-name="Register"
      className="flex h-screen w-screen flex-col items-center gap-4 bg-white p-3 sm:h-[600px] sm:w-[400px] sm:rounded-md"
    >
      <h1 className="text-2xl font-bold">Register</h1>

      <div className="cursor-pointer hover:text-blue-500" onClick={onClose}>
        返回
      </div>

      <form className="flex w-full flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full">
          <input
            className="h-10 w-full rounded-md border border-gray-200 px-2"
            type="text"
            {...form.register('username')}
            placeholder="请输入账号"
          />
          <p className="text-sm text-red-400">{form.formState.errors.username?.message}</p>
        </div>

        <div className="w-full">
          <input
            className="h-10 w-full rounded-md border border-gray-200 px-2"
            type="password"
            {...form.register('password')}
            placeholder="请输入密码"
          />
          <p className="text-sm text-red-400">{form.formState.errors.password?.message}</p>
        </div>

        <div className="w-full">
          <input
            className="h-10 w-full rounded-md border border-gray-200 px-2"
            type="email"
            {...form.register('email')}
            placeholder="请输入邮箱"
          />
          <p className="text-sm text-red-400">{form.formState.errors.email?.message}</p>
        </div>

        <button
          className="block h-10 w-full cursor-pointer rounded-full bg-green-500 text-white"
          type="submit"
        >
          登录
        </button>
      </form>
    </div>
  );
}
