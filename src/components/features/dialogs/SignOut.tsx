'use client';

import Button from '@/components/ui/Button';
import { useDialog } from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import { Routes } from '@/router/routes';
import useAppRouter from '@/router/useAppRouter';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function SignOut() {
  const dialog = useDialog();
  const globalStore = useGlobalStore((s) => s);
  const router = useAppRouter();
  const onSignOut = () => {
    globalStore.toggleLogin();
    dialog.close('SignOut').then(() => {
      router.replace(Routes.Home);
    });
  };

  return (
    <div data-name="SignOut" className="w-[310px] rounded-lg bg-[#212121] px-3 pb-6 text-white">
      <header className="flex items-center justify-between py-3">
        <h1 className="font-bold">Sair</h1>
        <Icon
          name="close"
          wrapperClass="size-7 bg-[#353535] rounded-sm"
          className="size-4"
          color="white"
          onClick={() => dialog.close('SignOut')}
        />
      </header>
      <div className="my-4 text-sm">
        Tem certeza de que quer sair? Você ainda tem promoções e bônus ativos!
      </div>
      <div className="flex items-center gap-2">
        <Button className="h-10 flex-1 rounded-md bg-[#353535] font-bold" onClick={onSignOut}>
          Sair
        </Button>
        <Button
          className="h-10 flex-1 rounded-md bg-green-400 font-bold text-amber-950"
          onClick={() => dialog.close('SignOut')}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
