'use client';

import GameItem from '@/components/features/GameItem';
import AppHeader from '@/components/ui/AppHeader';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

export default function GameList() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list" className="h-screen w-screen bg-white">
      <AppHeader title="游戏列表" />
      <div className="mt-4 grid grid-cols-3 gap-3 px-3">
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
      </div>
    </div>
  );
}
