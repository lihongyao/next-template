'use client';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div>
      <h1>游戏列表</h1>
      <Button
        onClick={() => {
          const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
          router.push(jumpToUrl + '/1?title=游戏详情');
        }}
      >
        查看游戏
      </Button>
    </div>
  );
}
