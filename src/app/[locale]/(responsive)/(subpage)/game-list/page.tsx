'use client';
import GameItem from '@/components/features/GameItem';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list">
      <main className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-5 md:grid-cols-7">
        {games.map((item, index) => (
          <GameItem
            game={item}
            key={index}
            onClick={() => {
              // const jumpUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
              // router.push(jumpUrl + '/' + index + 1);
            }}
          />
        ))}
      </main>
    </div>
  );
}
