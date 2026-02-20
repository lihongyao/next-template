// src/components/layout/SideNavLayout.tsx
export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center border-b px-3">
        <h1>Classic Layout</h1>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
