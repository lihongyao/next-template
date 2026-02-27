import ProgressiveImage from './ProgressiveImage';

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
      <ProgressiveImage src={game.src} blurSrc={game.blurSrc} className="h-auto w-[200px]" alt="" />
    </div>
  );
}
