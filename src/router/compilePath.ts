/**
 * 把 /foo/:id 这类简化路由规则转成正则。
 *
 * 当前只支持：
 * - 固定 segment，例如 /news
 * - 动态 segment，例如 /news/:id
 */
export function compilePath(path: string) {
  const regex = path.replace(/\//g, '\\/').replace(/:\w+/g, '[^/]+');
  return new RegExp(`^${regex}$`);
}
