interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}
export default function Button({ children, onClick }: ButtonProps) {
  return (
    <div
      className="w-fit cursor-pointer rounded-sm bg-green-700 px-3 py-1 text-sm text-white"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
