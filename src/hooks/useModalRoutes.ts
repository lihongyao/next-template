// src/hooks/useModalRoutes.ts
import { usePathname, useRouter } from '@/i18n/navigation';

export const useModalRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();

  const getMergePath = (target: string) => {
    if (!target) return target;
    // 确保目标路由以斜杠开头
    target = target.startsWith('/') ? target : `/${target}`;
    const base = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const index = pathname.indexOf(target);
    return index !== -1 ? `${pathname.slice(0, index)}${target}` : `${base}${target}`;
  };
  const getModalOrPagePath = () => {};

  return {
    getMergePath,
  };
};
