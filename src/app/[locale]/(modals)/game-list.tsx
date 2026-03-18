'use client';

import GameItem from '@/components/features/GameItem';
import AppHeader from '@/components/ui/AppHeader';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/router/routes';

export default function GameList() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div
      data-name="game-list"
      className="flex h-dvh w-dvw flex-col bg-white sm:h-[600px] sm:w-[400px]"
    >
      <AppHeader title="游戏列表" />
      <main className="no-scrollbar flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-3">
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
      </main>
    </div>
  );
}
