// src/components/layout/TopNavLayot.tsx
export default function TopNavLayot({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center border-b bg-black px-5">
        <h1 className="tracking-xs">Modern Layout</h1>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
