export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-name="side-nav-layout">
      <aside>side nav</aside>
      <main>
        <header>SideNavLayout</header>
        {children}
      </main>
      <footer></footer>
    </div>
  );
}
