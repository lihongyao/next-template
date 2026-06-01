'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';
import { Link } from '@/router';
import { Routes } from '@/router/routes';
import { RegisterFormValues, RegisterSubmitValues, registerSchema } from '@/schemas/user.schema';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function Register() {
  const { closeModal } = useModal();
  const { isMobile } = useDevice();
  const globalStore = useGlobalStore((s) => s);

  const bannerSrc = getImageUrl(`auth/banner-${isMobile ? 'h5' : 'pc'}_pt-br.jpg`);

  const form = useForm<RegisterFormValues, unknown, RegisterSubmitValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: 'admin',
      password: '123456',
    },
  });

  const onSubmit = (data: RegisterSubmitValues) => {
    console.log(data);
    closeModal();
    globalStore.toggleLogin();
  };

  return (
    <div
      data-name="Register"
      className="flex h-dvh w-dvw flex-col items-center gap-4 overflow-hidden bg-[#252526] sm:h-[600px] sm:w-[800px] sm:flex-row sm:items-start sm:gap-0 sm:rounded-3xl"
    >
      <img className="h-auto w-full sm:w-[380px]" src={bannerSrc} alt="banner" />
      <div className="w-full px-3 sm:px-6 sm:pt-6">
        <h1 className="mb-4 text-2xl font-bold text-white">Register</h1>
        <form className="flex w-full flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full">
            <input
              className="h-10 w-full rounded-md border border-none border-gray-200 bg-gray-950 px-2 text-white outline-none placeholder:text-gray-400"
              type="text"
              {...form.register('username')}
              placeholder="请输入账号"
            />
            <p className="text-sm text-red-400">{form.formState.errors.username?.message}</p>
          </div>

          <div className="w-full">
            <input
              className="h-10 w-full rounded-md border border-none border-gray-200 bg-gray-950 px-2 text-white outline-none placeholder:text-gray-400"
              type="password"
              {...form.register('password')}
              placeholder="请输入密码"
            />
            <p className="text-sm text-red-400">{form.formState.errors.password?.message}</p>
          </div>

          <div className="w-full">
            <input
              className="h-10 w-full rounded-md border border-none border-gray-200 bg-gray-950 px-2 text-white outline-none placeholder:text-gray-400"
              {...form.register('email')}
              placeholder="请输入邮箱"
            />
            <p className="text-sm text-red-400">{form.formState.errors.email?.message}</p>
          </div>
          <p className="text-white">
            <span>已有账号？</span>
            <Link href={Routes.ModalLogin}>前往登录</Link>
          </p>
          <button
            className="block h-11 w-full cursor-pointer rounded-md bg-green-500 text-white"
            type="submit"
          >
            注册
          </button>
        </form>
      </div>
    </div>
  );
}
