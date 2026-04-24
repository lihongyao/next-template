'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';
import { RegisterFormValues, registerSchema } from '@/schemas/user.schema';

export default function Register() {
  const { closeModal } = useModal();
  const { isMobile } = useDevice();
  const bannerSrc = getImageUrl(`auth/banner-${isMobile ? 'h5' : 'pc'}_pt-br.jpg`);

  const form = useForm<RegisterFormValues>({
    // @ts-expect-error
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log(data);
  };

  return (
    <div
      data-name="Register"
      className="flex h-dvh w-dvw flex-col items-center gap-4 bg-white sm:h-[600px] sm:w-[400px] sm:rounded-md"
    >
      <img className="h-auto w-full" src={bannerSrc} alt="banner" />
      <div className="w-full px-3">
        <h1 className="text-2xl font-bold">Register</h1>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit as unknown as SubmitHandler<FieldValues>)}
        >
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
    </div>
  );
}
