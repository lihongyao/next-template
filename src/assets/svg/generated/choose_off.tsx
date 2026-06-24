import type { SVGProps } from 'react';

const SvgChooseOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    {...props}
  >
    <rect width={15} height={15} x={0.5} y={0.5} stroke="#b3b8c1" rx={3.5} />
  </svg>
);
export default SvgChooseOff;
