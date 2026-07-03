import { getPathname, redirect, usePathname } from '@/i18n/navigation';

import Link from './AppLink';
import { matchRouteMeta } from './matchRoute';
import useRouter from './useAppRouter';

// 业务侧统一从这里拿导航能力，避免直接绕过 locale、route modal 和转场封装。
export { getPathname, Link, matchRouteMeta, redirect, usePathname, useRouter };
