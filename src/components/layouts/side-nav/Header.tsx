'use client';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { Routes } from '@/libs/routes';
import { useBrandConfig } from '@/providers/brand.provider';
import { useRouter } from '@/router';

export default function Header() {
  const router = useRouter();
  const { appName } = useBrandConfig();
  const { mergeRouteIntoCurrentPath } = useModalRoutes();
  return (
    <>
      {/* <div className="__place-space h-[56px]" /> */}
      <header className="sticky top-0 left-0 flex h-[56px] w-full items-center justify-between bg-black px-3 text-white">
        <h1 onClick={() => router.push(Routes.Home)}>{appName}</h1>
        <div>
          <Button
            onClick={() =>
              router.push(mergeRouteIntoCurrentPath(Routes.ModalLogin), {
                scroll: false,
              })
            }
          >
            登录
          </Button>
        </div>
      </header>
    </>
  );
}
