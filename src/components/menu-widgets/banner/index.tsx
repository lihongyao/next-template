import { memo } from 'react';

export type BannerProps = {
  image_h5: string;
  image_pc: string;
  collapsed_image?: string;
};

export default memo(function Banner({
  collapsed,
  data: { image_h5, image_pc, collapsed_image },
}: {
  collapsed?: boolean;
  data: BannerProps;
}) {
  if (!image_h5 && !image_pc) return null;
  if (collapsed && !collapsed_image) return null;
  return (
    <div data-name="banner" className="cursor-pointer overflow-hidden rounded-lg">
      {collapsed ? (
        collapsed_image ? (
          <img className="h-auto w-full" src={collapsed_image} alt="" />
        ) : null
      ) : (
        <>
          <img className="isMobile h-auto w-full" src={image_h5} alt="" />
          <img className="isTabletOrDesktop h-auto w-full" src={image_pc} alt="" />
        </>
      )}
    </div>
  );
});
