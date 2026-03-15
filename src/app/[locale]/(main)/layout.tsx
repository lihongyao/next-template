import PageTransition from '@/components/features/PageTransition';
import { AppLayouts } from '@/components/layouts';
import { getBrandConfigSSR } from '@/libs/brand';

export default async function ThemeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { layout } = await getBrandConfigSSR();
  const AppLayout = AppLayouts[layout];

  return (
    <AppLayout>
      <PageTransition>{children}</PageTransition>
    </AppLayout>
  );
}
