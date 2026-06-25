'use client';

import Button from '@/components/ui/Buttons/BaseButton';
import { ZIndex } from '@/constants/z-index';
import { useBrandConfig } from '@/providers/brand.provider';
import { Link, useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function Header() {
  const router = useRouter();
  const { appName } = useBrandConfig();
  return (
    <header
      className="sticky top-0 left-0 flex h-[56px] w-full items-center justify-between bg-[#161616] px-3 text-white"
      style={{ zIndex: ZIndex.Header }}
    >
      <Link href={Routes.Home}>
        <img src={'/res/afun/logo.png'} alt="logo" className="h-[30px] w-auto" />
      </Link>
      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            router.push(Routes.ModalLogin, {
              scroll: false,
            })
          }
        >
          登录
        </Button>
        <Button
          onClick={() =>
            router.push(Routes.ModalRegister, {
              scroll: false,
            })
          }
        >
          注册
        </Button>
      </div>
    </header>
  );
}
