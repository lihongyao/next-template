'use client';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { ZIndex } from '@/constants';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { Link } from '@/i18n/navigation';
import { getImageUrl } from '@/libs/cdn-image';
import { cn } from '@/libs/class-helpers';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function Header({ fixed = false }: { fixed?: boolean }) {
  const router = useRouter();
  const { isLogin } = useGlobalStore();
  const { mergeRouteIntoCurrentPath, resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <header
      className={cn(
        'top-0 left-0 h-[56px] w-full bg-[#161616] px-3 text-white',
        fixed ? 'fixed' : 'sticky',
      )}
      style={{ zIndex: ZIndex.Header }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
        <Link href={Routes.Home}>
          <Image
            src={'/res/afun/logo.png'}
            height={100}
            width={100}
            alt="logo"
            className="h-[30px] w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          {isLogin ? (
            <>
              <Button
                className="isTabletOrDesktop h-[36px]"
                onClick={() => {
                  router.push(Routes.Cart);
                }}
              >
                购物车
              </Button>

              <Icon
                name="message"
                className="size-4"
                wrapperClass="size-[36px] bg-gray-600 rounded-sm isTabletOrDesktop"
              />
              <img
                className="size-[36px] rounded-sm"
                src={getImageUrl('avatars/h_0.jpg')}
                onClick={() => {
                  router.push(Routes.ModalProfile, { scroll: false });
                }}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
