'use client';

import { cn } from '@/libs/class-helpers';
import { type SoundName, playSound } from '@/libs/sound';

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  sound?: SoundName | false;
}
export default function BaseButton({
  children,
  disabled,
  className,
  onClick,
  sound = 'buttonClick',
}: ButtonProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-fit cursor-pointer items-center justify-center rounded-sm bg-linear-90 from-[#31ED87] to-[#95E974] px-3 text-sm font-extrabold text-[#1C2532]',
        className,
      )}
      onClick={() => {
        if (disabled) return;
        if (sound) playSound(sound);
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}
