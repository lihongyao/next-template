import type { SVGProps } from 'react';

const SvgGlassBorder = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 36 36"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="currentColor"
      fillOpacity={0.01}
      d="M0 10C0 4.477 4.477 0 10 0h16c5.523 0 10 4.477 10 10v16c0 5.523-4.477 10-10 10H10C4.477 36 0 31.523 0 26z"
    />
  </svg>
);
export default SvgGlassBorder;
