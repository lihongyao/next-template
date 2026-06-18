// src/app/[lang]/_components/ServerInfo.tsx
import { getServerBrandConfig } from '@/libs/brand.server';

export default async function ServerInfo() {
  const brand = await getServerBrandConfig();
  return (
    <div>
      <h2 className="mb-4">—— 服务端组件 ——</h2>
      <h2>当前主题: {brand.theme}</h2>
      <h2>当前皮肤: {brand.skin}</h2>
      <h2>当前布局: {brand.layout}</h2>
      <h2>当前品牌：{brand.appName}</h2>
    </div>
  );
}
