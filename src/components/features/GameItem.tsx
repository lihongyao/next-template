import LazyImg from '../ui/LazyImage';

interface GameItemProps {
  game: {
    placeholderSrc: string;
    src: string;
  };
  onClick?: () => void;
}
export default function GameItem({ game, onClick }: GameItemProps) {
  return (
    <div className="aspect-[200/267] overflow-hidden rounded-md" onClick={onClick}>
      <LazyImg
        src={game.src}
        className="h-full w-full bg-gray-200"
        placeholderSrc={game.placeholderSrc}
        alt=""
      />
    </div>
  );
}
