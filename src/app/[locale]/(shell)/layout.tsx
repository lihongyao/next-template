'use client';
import { useRouter } from '@/i18n/navigation';

export default function ShellLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div data-name="shell-layout">
      {/* 导航栏 */}
      <header className="sticky top-0 left-0 flex h-12 items-center justify-center bg-blue-500 text-white">
        <div
          className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
          onClick={() => router.back()}
        >
          👈 返回
        </div>
        <h1 className="text-md text-center font-bold">{title}</h1>
      </header>
      {/* 内容区 */}
      <main className="p-3">{children}</main>
    </div>
  );
}
