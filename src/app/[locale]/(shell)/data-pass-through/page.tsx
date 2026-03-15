'use client';

import { useConfig } from './config.provider';

export default function Page() {
  const config = useConfig();
  return (
    <div>
      {config.version} - {config.timestamp}
    </div>
  );
}
