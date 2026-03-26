'use client';
import Button from '@/components/ui/Button';
import { ZIndex } from '@/constants';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useBrandConfig } from '@/providers/brand.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function Header() {
  const router = useRouter();
  const { appName } = useBrandConfig();
  const { mergeRouteIntoCurrentPath } = useModalRoutes();
  return (
    <header
      className="sticky top-0 left-0 flex h-[56px] w-full items-center justify-between bg-[#161616] px-3 text-white"
      style={{ zIndex: ZIndex.Header }}
    >
      <h1 onClick={() => router.push(Routes.Home)}>{appName}</h1>
      <div className="flex items-center gap-3">
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
    </header>
  );
}
