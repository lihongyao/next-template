import ResponsiveShell from '@/components/shell/ResponsiveShell';

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return <ResponsiveShell>{children}</ResponsiveShell>;
}
