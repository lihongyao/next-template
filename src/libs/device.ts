/**
 * 基于 UA 判断是否为移动端，供服务端/客户端复用。
 * 无额外依赖，与 afun-front-x 的 mobilePatterns 逻辑一致。
 */
export function checkIsMobileFromUA(ua: string): boolean {
  if (!ua) return false;
  const mobilePatterns =
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone|HarmonyOS|PlayBook|Opera Mini|Opera Mobi)/i;
  return mobilePatterns.test(ua);
}
