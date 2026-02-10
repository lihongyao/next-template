import Header from './Header';

export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-name="side-nav-layout">
      <main>
        <Header />
        {children}
      </main>
      <aside>side nav</aside>
      <footer></footer>
    </div>
  );
}
