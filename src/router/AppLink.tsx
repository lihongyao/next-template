'use client';

import { MouseEvent, ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

import useAppRouter from './useAppRouter';

type AppLinkProps = React.ComponentProps<typeof Link> & {
  children: ReactNode;
};

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function AppLink({ href, replace, children, ...rest }: AppLinkProps) {
  const router = useAppRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    rest.onClick?.(e);
    if (e.defaultPrevented) return;
    if (!href) return;
    if (!isPlainLeftClick(e)) return;
    if (rest.target && rest.target !== '_self') return;
    if (rest.download !== undefined) return;

    e.preventDefault();

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
