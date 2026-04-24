import type { SVGProps } from 'react';

const SvgClose = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <mask
      id="a"
      width={24}
      height={24}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="currentColor" d="M0 0h24v24H0z" />
    </mask>
    <g mask="url(#a)">
      <path
        fill="currentColor"
        d="M7.1 18.3a.99.99 0 1 1-1.4-1.4l4.9-4.9-4.9-4.9a.99.99 0 1 1 1.4-1.4l4.9 4.9 4.9-4.9a.99.99 0 1 1 1.4 1.4L13.4 12l4.9 4.9a.99.99 0 1 1-1.4 1.4L12 13.4z"
      />
    </g>
  </svg>
);
export default SvgClose;
