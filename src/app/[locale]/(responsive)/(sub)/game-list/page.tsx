'use client';
import GameItem from '@/components/features/GameItem';
import AppHeader from '@/components/ui/AppHeader';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list">
      <AppHeader title="游戏列表" />
      <main className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-5 md:grid-cols-7">
        {games.map((item, index) => (
          <GameItem
            game={item}
            key={index}
            onClick={() => {
              // const jumpUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
              router.push(`${Routes.GameList}/${index + 1}?title=游戏详情`);
            }}
          />
        ))}
      </main>
    </div>
  );
}
