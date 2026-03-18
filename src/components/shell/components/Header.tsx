'use client';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useBrandConfig } from '@/providers/brand.provider';
import { useRouter } from '@/router';
import { ModalPageRoutes, Routes } from '@/router/routes';

export default function Header() {
  const router = useRouter();
  const { appName } = useBrandConfig();
  const { mergeRouteIntoCurrentPath, resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <header className="sticky top-0 left-0 flex h-[56px] w-full items-center justify-between bg-[#161616] px-3 text-white">
      <h1 onClick={() => router.push(Routes.Home)}>{appName}</h1>
      <div className="flex items-center gap-3">
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
    </header>
  );
}
