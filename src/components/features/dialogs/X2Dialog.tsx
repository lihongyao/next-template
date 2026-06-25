// src/components/features/dialogs/X2Dialog.tsx
'use client';

import Button from '@/components/ui/Buttons/BaseButton';
import { useDialog } from '@/components/ui/Dialog';
import { useBrandConfig } from '@/providers/brand.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function X2Dialog() {
  const brand = useBrandConfig();
  const dialog = useDialog();
  const router = useRouter();
  return (
    <div className="flex w-[400px] flex-col gap-4 rounded bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold">X2 Dialog 标题</h2>
      <p>这是 X2 弹框内容</p>
      <p>
        {brand.appName} - {brand.skin}
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            dialog.open('X3Dialog', {
              onAfterClose(event) {
                console.log('X3 closed >>>', event);
              },
            });
          }}
        >
          打开X3
        </Button>
        <Button
          onClick={() => {
            dialog.close().then(() => router.push(Routes.Cart));
          }}
        >
          跳转其他页面
        </Button>
        <Button
          onClick={() => {
            dialog.close('X2Dialog').then(() => router.back());
          }}
        >
          返回
        </Button>
      </div>
    </div>
  );
}
