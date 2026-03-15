'use client';

import { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

import useAppRouter from './useAppRouter';

type AppLinkProps = React.ComponentProps<typeof Link> & {
  children: ReactNode;
};

export default function AppLink({ href, replace, children, ...rest }: AppLinkProps) {
  const router = useAppRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!href) return;

    if (replace) {
      router.replace(href as string);
    } else {
      router.push(href as string);
    }
  };

  return (
    <Link href={href ?? ''} replace={replace} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
