import type { SVGProps } from 'react';

const SvgTime = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="currentColor"
        d="M21.817 12c0-5.422-4.396-9.817-9.818-9.817S2.182 6.578 2.182 12s4.395 9.818 9.817 9.818 9.818-4.396 9.818-9.818m-4.966 1.206a1.091 1.091 0 0 1-.976 1.952zm-5.942-7.751a1.09 1.09 0 1 1 2.182 0v5.87l3.76 1.881-.488.976-.488.976-4.363-2.181a1.09 1.09 0 0 1-.603-.977zM23.999 12c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="currentColor" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgTime;
