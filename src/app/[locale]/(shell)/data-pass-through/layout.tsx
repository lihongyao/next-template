import { ConfigProvider } from './config.provider';

async function sleep(interval = 1000) {
  return new Promise((resolve) => setTimeout(resolve, interval));
}
export default async function DataPathThrough({ children }: { children: React.ReactNode }) {
  // 1. 模拟请求数据
  await sleep(1000);
  // 2. 构造数据
  const data = { version: '1.0.0', timestamp: Date.now() };
  // 3. 将数据传递给子组件
  return <ConfigProvider value={data}>{children}</ConfigProvider>;
}
