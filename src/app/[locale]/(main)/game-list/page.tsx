'use client';
import GameItem from '@/components/features/GameItem';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes } from '@/libs/routes';

const games = [
  {
    src: 'https://imgxcut.com/game/image/1af8810972.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/1af8810972.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/dba24b089d.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/dba24b089d.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/68dcf41478.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/68dcf41478.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/67797618ac.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/67797618ac.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/29db88866d.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/29db88866d.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/826f50c909.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/826f50c909.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/ec1aac9df9.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/ec1aac9df9.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/7c5c2e7e40.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/7c5c2e7e40.png?,_v=4,width=100,blur=50',
  },
  {
    src: 'https://imgxcut.com/game/image/7c249efb60.png?_v=4,dpr=4,width=200',
    blurSrc: 'https://imgxcut.com/game/image/7c249efb60.png?,_v=4,width=100,blur=50',
  },
];

export default function GamePage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="game-list">
      <Button onClick={() => router.back()}>返回</Button>
      <div className="mt-4 grid grid-cols-3 gap-2">
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
