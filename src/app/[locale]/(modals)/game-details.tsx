'use client';

import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useModal } from '@/providers/modal.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function ModalGame() {
  const { closeModal } = useModal();
  const { getModalParams } = useModalRoutes();

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
          router.push(Routes.ModalProfile);
        }}
      >
        个人中心
      </Button>
    </div>
  );
}
