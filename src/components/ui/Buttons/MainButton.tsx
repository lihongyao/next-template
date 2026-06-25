import { cn } from '@/libs/class-helpers';

interface MainButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}
export default function Button({ children, disabled, className, onClick }: MainButtonProps) {
  return (
    <div
      className={cn(
        'flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-linear-90 from-[#31ED87] to-[#95E974] px-3 text-sm font-extrabold text-[#1C2532]',
        className,
      )}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}
