import AppHeader from '@/components/ui/AppHeader';

export default function Level2({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white">
      <AppHeader title="移动端顶部" />
      {children}
    </div>
  );
}
