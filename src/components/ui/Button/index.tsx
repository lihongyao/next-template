import { cn } from '@/libs/class-helpers';

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}
export default function Button({ children, disabled, className, onClick }: ButtonProps) {
  return (
    <div
      className={cn(
        'flex w-fit cursor-pointer items-center justify-center rounded-sm bg-green-700 px-3 py-1 text-sm text-white',
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
