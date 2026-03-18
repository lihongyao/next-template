export function compilePath(path: string) {
  const regex = path.replace(/\//g, '\\/').replace(/:\w+/g, '[^/]+');
  return new RegExp(`^${regex}$`);
}
