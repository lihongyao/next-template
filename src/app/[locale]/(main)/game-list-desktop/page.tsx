'use client';
import GameItem from '@/components/features/GameItem';
import Button from '@/components/ui/Button';
import { games } from '@/constants/data';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list" className="pt-3">
      <Button onClick={() => router.back()}>返回</Button>
      <div className="mt-4 grid grid-cols-5 gap-4 md:grid-cols-7">
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
