import { ModalComponentProps } from '@/components/features/RouteModalRenderer';

export default function Login({ onCloseAction }: ModalComponentProps) {
  return (
    <div data-name="Login" className="h-screen w-screen bg-amber-600">
      <div>登录</div>
      <div onClick={onCloseAction}>返回</div>
    </div>
  );
}
