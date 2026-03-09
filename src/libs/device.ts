import { UAParser } from 'ua-parser-js';

export function getDeviceType(userAgent: string) {
  const uaParser = new UAParser();
  uaParser.setUA(userAgent);
  const result = uaParser.getResult();
  return {
    isMobile: result.device.type === 'mobile',
    isTablet: result.device.type === 'tablet',
    isDesktop: result.device.type === 'desktop',
  };
}
