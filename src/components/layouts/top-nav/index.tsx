// src/components/layout/TopNavLayot.tsx
export default function TopNavLayot({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 left-0 flex h-14 items-center border-b bg-black px-5">
        <h1 className="tracking-xs">Modern Layout</h1>
      </header>
      <main className="p-3">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
