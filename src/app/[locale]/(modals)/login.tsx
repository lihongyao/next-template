'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Icon from '@/components/ui/Icon';
import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';
import { Link } from '@/router';
import { Routes } from '@/router/routes';
import { LoginFormValues, LoginSubmitValues, loginSchema } from '@/schemas/user.schema';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function Register() {
  const { closeModal } = useModal();
  const { isMobile } = useDevice();
  const globalStore = useGlobalStore((s) => s);

  const bannerSrc = getImageUrl(`auth/banner-${isMobile ? 'h5' : 'pc'}_pt-br.jpg`);
  const [isRemember, setIsRemember] = useState(false);

  const form = useForm<LoginFormValues, unknown, LoginSubmitValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: 'admin',
      password: '123456',
    },
  });

  const onSubmit = (data: LoginSubmitValues) => {
    console.log(data);
    closeModal();
    globalStore.toggleLogin();
  };

  return (
    <div
      data-name="Login"
      className="flex h-dvh w-dvw flex-col items-center gap-4 overflow-hidden bg-[#252526] sm:h-[600px] sm:w-[800px] sm:flex-row sm:items-start sm:gap-0 sm:rounded-3xl"
    >
      <img className="h-auto w-full sm:w-[380px]" src={bannerSrc} alt="banner" />
      <Icon
        name="close"
        wrapperClass="size-6 fixed top-[10px] right-[10px] sm:top-6 sm:right-6 cursor-pointer bg-white/10 rounded-md"
        className="size-[18px]"
        color="white"
        onClick={closeModal}
      />

      <div className="w-full px-3 sm:px-6 sm:pt-6">
        <h1 className="mb-4 text-base font-bold text-white">Sign In</h1>
        <form className="flex w-full flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full">
            <input
              className="h-12 w-full rounded-md border border-none border-gray-200 bg-[#161616] px-2 text-white outline-none placeholder:text-gray-400"
              type="text"
              {...form.register('username')}
              placeholder="请输入账号"
            />
            <p className="text-sm text-red-400">{form.formState.errors.username?.message}</p>
          </div>

          <div className="w-full">
            <input
              className="h-12 w-full rounded-md border border-none border-gray-200 bg-[#161616] px-2 text-white outline-none placeholder:text-gray-400"
              type="password"
              {...form.register('password')}
              placeholder="请输入密码"
            />
            <p className="text-sm text-red-400">{form.formState.errors.password?.message}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRemember ? (
                <Icon
                  name="choose_on"
                  className="size-4"
                  onClick={() => setIsRemember(!isRemember)}
                />
              ) : (
                <Icon
                  name="choose_off"
                  className="size-4"
                  color="#B3B8C1"
                  onClick={() => setIsRemember(!isRemember)}
                />
              )}
              <span className="text-xs text-white">Remember Me</span>
            </div>
            <div className="text-xs text-[#B3B8C1]">Forget password？</div>
          </div>
          <button
            className="block h-11 w-full cursor-pointer rounded-md bg-[#31ED87] font-extrabold text-[#1C2532]"
            type="submit"
          >
            Sign In
          </button>

          <div className="flex items-center">
            <span className="text-xs text-white">Don't have an account？</span>
            <Link className="text-sm font-bold text-[#31ED87]" href={Routes.ModalRegister} replace>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
