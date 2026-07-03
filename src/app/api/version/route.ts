import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';

export async function GET() {
  const version =
    process.env.NEXT_PUBLIC_APP_VERSION ||
    fs.readFileSync(path.join(process.cwd(), '.next/BUILD_ID'), 'utf8').trim();

  return NextResponse.json(
    { version },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
