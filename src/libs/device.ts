import { UAParser } from 'ua-parser-js';

export function getDeviceInfoWithUserAgent(userAgent: string) {
  const uaParser = new UAParser();
  uaParser.setUA(userAgent);
  const result = uaParser.getResult();
  return {
    isiOS: result.os.name === 'iOS',
    isAndroid: result.os.name === 'Android',
    isMobile: result.device.type === 'mobile',
    isTablet: result.device.type === 'tablet',
    isDesktop: result.device.type === 'desktop',
  };
}
