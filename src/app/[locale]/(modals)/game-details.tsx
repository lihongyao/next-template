import { useEffect } from 'react';

import { ModalComponentProps } from '@/components/features/RouteModalRenderer';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { Routes } from '@/libs/routes';

export default function ModalGame({ onClose }: ModalComponentProps) {
  const { getModalParams } = useModalRoutes();

  useEffect(() => {
    const params = getModalParams(Routes.ModalGameDetails);
    console.log('params >> ', params);
  }, []);

  return (
    <div data-name="game-details" className="h-dvh w-dvw bg-white p-2">
      <div>游戏详情</div>
      <div onClick={onClose}>返回</div>
    </div>
  );
}
