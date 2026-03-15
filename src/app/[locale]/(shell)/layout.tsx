import PageTransition from '@/components/features/PageTransition';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
