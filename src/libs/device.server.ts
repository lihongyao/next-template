import { headers } from 'next/headers';

import { checkIsMobileFromUA } from './device';

export async function getSSRDeviceContext() {
  const headersList = await headers();
  const ua = headersList.get('user-agent') || '';
  const initialIsMobile = checkIsMobileFromUA(ua);
  return { ua, initialIsMobile };
}
