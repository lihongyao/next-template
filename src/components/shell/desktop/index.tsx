import Header from '../components/Header';
import Footer from './Footer';

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white">
      <Header />
      <div className="mx-auto w-full max-w-[1200px]">
        {children}
        <Footer />
      </div>
    </div>
  );
}
