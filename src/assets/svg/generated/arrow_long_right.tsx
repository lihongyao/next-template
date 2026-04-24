import type { SVGProps } from 'react';

const SvgArrowLongRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 35 35"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="url(#a)"
      d="M0 8a8 8 0 0 1 8-8h19a8 8 0 0 1 8 8v19a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.781}
      d="m19.786 20.667 3.255-3.167m0 0-3.255-3.167m3.255 3.167H11.958"
    />
    <defs>
      <linearGradient id="a" x1={17.5} x2={17.5} y1={0} y2={35} gradientUnits="userSpaceOnUse">
        <stop stopColor="#3c3c3c" />
        <stop offset={1} stopColor="#212121" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgArrowLongRight;
