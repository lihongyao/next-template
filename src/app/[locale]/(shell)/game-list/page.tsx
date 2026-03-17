'use client';
import GameItem from '@/components/features/GameItem';
import AppHeader from '@/components/ui/AppHeader';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list">
      <AppHeader title="游戏列表" />
      <main className="grid grid-cols-3 gap-3 p-3">
        {games.map((item, index) => (
          <GameItem
            game={item}
            key={index}
            onClick={() => {
              const jumpUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
              router.push(jumpUrl + '/' + index + 1);
            }}
          />
        ))}
      </main>
    </div>
  );
}
