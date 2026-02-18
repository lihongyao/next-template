import { useEffect } from 'react';

import { ModalComponentProps } from '@/components/features/RouteModalRenderer';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { Routes } from '@/libs/routes';

export default function ModalGame({ onClose }: ModalComponentProps) {
  const { getModalParams } = useModalRoutes();

  useEffect(() => {
    const params = getModalParams(Routes.ModalGame);
    console.log('params >> ', params);
  }, []);
  return (
    <div className="h-screen w-screen bg-white">
      <div>游戏列表</div>123
      <div onClick={onClose}>返回</div>
    </div>
  );
}
