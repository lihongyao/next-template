'use client';

import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { Routes } from '@/libs/routes';
import { useModal } from '@/providers/modal.provider';

export default function ModalGame() {
  const { closeModal } = useModal();
  const { getModalParams, mergeRouteIntoCurrentPath } = useModalRoutes();

  const router = useRouter();

  useEffect(() => {
    const params = getModalParams(Routes.ModalGameDetails);
    console.log('params >> ', params);
  }, []);

  return (
    <div data-name="game-details" className="h-dvh w-dvw space-y-2 bg-white p-2">
      <div>游戏详情</div>
      <Button onClick={closeModal}>返回</Button>
      <Button
        onClick={() => {
          router.push(mergeRouteIntoCurrentPath(Routes.ModalProfile));
        }}
      >
        个人中心
      </Button>
    </div>
  );
}
