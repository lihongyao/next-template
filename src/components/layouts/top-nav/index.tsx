export default function TopNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-name="top-nav-layout">
      <header>modern layout</header>
      <main>
        <div>{children}</div>
      </main>
    </div>
  );
}
