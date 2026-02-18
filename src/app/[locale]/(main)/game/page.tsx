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
          const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes.game);
          router.push(jumpToUrl + '/1');
        }}
      >
        查看游戏
      </Button>
    </div>
  );
}
