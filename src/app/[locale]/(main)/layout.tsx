import { AppLayouts } from '@/components/layouts';
import { getBrandConfigSSR } from '@/libs/brand';

export default async function ThemeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { layout } = await getBrandConfigSSR();
  const AppLayout = AppLayouts[layout];
  return <AppLayout>{children}</AppLayout>;
}
