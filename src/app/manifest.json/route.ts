import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /manifest.json
 * 动态生成 PWA manifest，每次请求都从后端获取最新配置
 * 可选 ?value=<JSON>：读取其中的 screenshots 覆盖 manifest.screenshots，start_url 覆盖 manifest.start_url
 */
export async function GET(request: NextRequest) {
  console.log(request);

  return NextResponse.json(
    {
      name: 'Next.js Template',
      short_name: 'Next.js Template',
      description: 'Next.js Template',
      icons: [
        {
          src: '/res/afun/favicon.ico',
          sizes: '16x16',
          type: 'image/x-icon',
        },
      ],
      start_url: '/',
      display: 'standalone',
      theme_color: '#874334',
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}
