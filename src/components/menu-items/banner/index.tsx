import { memo } from 'react';

export default memo(function Banner(props: { img: string }) {
  if (!props.img) return null;
  return (
    <div data-name="banner" className="overflow-hidden rounded-lg">
      <img className="h-auto w-full" src={props.img} alt="" />
    </div>
  );
});
