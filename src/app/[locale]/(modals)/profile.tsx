'use client';

import copy from 'copy-to-clipboard';

import Button from '@/components/ui/Button';
import { useDialog } from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import { SvgPathName } from '@/components/ui/Icon/svgPath_all';
import { getImageUrl } from '@/libs/cdn-image';
import { useModal } from '@/providers/modal.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

const functions: Array<{ label: string; icon: SvgPathName; path?: string }> = [
  { label: '通知', icon: 'message', path: Routes.Notice },
  { label: '设置', icon: 'settings' },
];

export default function Profile() {
  const { closeModal } = useModal();
  const dialog = useDialog();
  const router = useRouter();

  return (
    <div
      data-name="Profile"
      className="relative flex h-dvh w-dvw flex-col justify-start gap-8 bg-[#101010] px-3 sm:h-[600px] sm:w-[400px] sm:rounded-xl"
    >
      <Icon
        name="arrow_left"
        className="size-3"
        color="white"
        wrapperClass="size-6 bg-white/30 rounded-sm absolute top-3 left-3"
        onClick={closeModal}
      />

      {/* 基本信息 */}
      <div className="pt-[48px]">
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className="size-[80px] rounded-full border-4 border-[#353535]"
            style={{ background: `url(${getImageUrl('avatars/h_0.jpg')}) center center / cover` }}
          />
          <div className="flex flex-col justify-end gap-2">
            <div className="flex items-center gap-2 text-sm text-white">
              <span>城南李大爷</span>
              <Icon
                name="edit"
                className="size-[14px]"
                color="#b3b8c1"
                wrapperClass="button-animation"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-[#b3b8c1]">
              <span>ID:1314210</span>
              <Icon
                name="copy"
                wrapperClass="button-animation"
                className="size-[16px]"
                color="#b3b8c1"
                onClick={async () => {
                  await copy('1314210');
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 钱包 */}
      <div className="flex items-center justify-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-sm text-[#b3b8c1]">Points</div>
          <div className="text-lg font-extrabold text-white">R$ 10.665,07</div>
        </div>
        <div className="h-full w-[1px] bg-gray-600"></div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-sm text-[#b3b8c1]">Points</div>
          <div className="text-lg font-extrabold text-white">R$ 62,20</div>
        </div>
      </div>
      {/* 功能列表 */}
      <div className="rounded-lg bg-[#212121]">
        {functions.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3">
            <div
              className="flex flex-1 items-center gap-2"
              onClick={() => {
                if (item.path) {
                  router.push(item.path);
                }
              }}
            >
              <Icon name={item.icon} className="size-5 text-[#b3b8c1]" />
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.label === '通知' && (
                <div className="flex size-6 items-center justify-center rounded-sm bg-green-700 text-sm text-white">
                  9
                </div>
              )}
              <Icon
                name="arrow_right"
                wrapperClass="size-6 bg-white/30 rounded-sm"
                className="size-3 text-[#b3b8c1]"
              />
            </div>
          </div>
        ))}
      </div>
      {/* 退出登录 */}
      <Button
        className="h-11 w-full rounded-lg bg-[#212121]"
        onClick={() => dialog.open('SignOut')}
      >
        退出登录
      </Button>
    </div>
  );
}
