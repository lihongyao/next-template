'use client';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list" className="flex flex-col gap-2">
      {Array.from({ length: 9 }).map((_, index) => (
        <Button
          key={index}
          onClick={() => {
            const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
            router.push(jumpToUrl + `/${index + 1}?title=游戏详情`);
          }}
        >
          查看游戏 {index + 1}
        </Button>
      ))}
    </div>
  );
}
