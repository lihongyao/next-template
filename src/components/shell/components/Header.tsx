'use client';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import { ZIndex } from '@/constants';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { Link } from '@/i18n/navigation';
import { useBrandConfig } from '@/providers/brand.provider';
import { useRouter } from '@/router';
import { ModalPageRoutes, Routes } from '@/router/routes';

export default function Header() {
  const router = useRouter();
  const { appName } = useBrandConfig();
  const { mergeRouteIntoCurrentPath, resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <header
      className="sticky top-0 left-0 h-[56px] w-full bg-[#161616] px-3 text-white"
      style={{ zIndex: ZIndex.Header }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
        <Link href={Routes.Home}>
          <Image
            src={'/res/afun/logo.png'}
            height={30}
            width={30}
            alt="logo"
            className="h-[30px] w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Button
            className="isTabletOrDesktop"
            onClick={() => {
              router.push(Routes.Cart);
            }}
          >
            购物车
          </Button>
          <Button
            className="isTabletOrDesktop"
            onClick={() => {
              const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes.profile);
              router.push(jumpToUrl, { scroll: false });
            }}
          >
            个人中心
          </Button>
          <Button
            onClick={() =>
              router.push(mergeRouteIntoCurrentPath(Routes.ModalLogin), {
                scroll: false,
              })
            }
          >
            登录
          </Button>
          <Button
            onClick={() =>
              router.push(mergeRouteIntoCurrentPath(Routes.ModalRegister), {
                scroll: false,
              })
            }
          >
            注册
          </Button>
        </div>
      </div>
    </header>
  );
}
