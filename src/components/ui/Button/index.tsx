interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
export default function Button({ children, disabled, onClick }: ButtonProps) {
  return (
    <div
      className="w-fit cursor-pointer rounded-sm bg-green-700 px-3 py-1 text-sm text-white"
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}
