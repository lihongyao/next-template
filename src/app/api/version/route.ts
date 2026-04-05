import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';

export async function GET() {
  const buildId = fs.readFileSync(path.join(process.cwd(), '.next/BUILD_ID'), 'utf8').trim();

  return NextResponse.json(
    { version: buildId },
    {
      headers: {
        // ⭐ 永远不要缓存
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
