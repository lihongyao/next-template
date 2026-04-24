import type { SVGProps } from 'react';

const SvgArrowLongLeft = (props: SVGProps<SVGSVGElement>) => (
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
      d="M35 8a8 8 0 0 0-8-8H8a8 8 0 0 0-8 8v19a8 8 0 0 0 8 8h19a8 8 0 0 0 8-8z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.781}
      d="M15.214 20.667 11.959 17.5m0 0 3.255-3.167M11.959 17.5h11.083"
    />
    <defs>
      <linearGradient id="a" x1={17.5} x2={17.5} y1={0} y2={35} gradientUnits="userSpaceOnUse">
        <stop stopColor="#3c3c3c" />
        <stop offset={1} stopColor="#212121" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgArrowLongLeft;
