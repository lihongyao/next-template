import LazyImg from '../ui/LazyImage';

interface GameItemProps {
  game: {
    blurSrc: string;
    src: string;
  };
  onClick?: () => void;
}
export default function GameItem({ game, onClick }: GameItemProps) {
  return (
    <div className="aspect-[200/267] overflow-hidden rounded-md" onClick={onClick}>
      <LazyImg src={game.src} className="h-full w-full" blurSrc={game.blurSrc} alt="" />
    </div>
  );
}
