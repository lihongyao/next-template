import { routes } from './routes';

export function matchRoute(pathname: string) {
  if (pathname.startsWith('/game-list')) {
    return routes['/game-list'];
  }

  return (
    routes[pathname] ?? {
      mobileLevel: 1,
      desktopLevel: 1,
    }
  );
}
