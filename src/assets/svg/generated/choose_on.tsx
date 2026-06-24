import type { SVGProps } from 'react';

const SvgChooseOn = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    {...props}
  >
    <rect width={16} height={16} fill="#31ed87" rx={4} />
    <path
      fill="#2a2a2b"
      d="M12.995 5.201s-1.599.533-3.465 2.666c-1.732 1.932-2.132 2.732-2.798 3.798-.067-.067-1.067-2-3.732-3.398l1.4-1.333s1.265.866 2.132 2.465c0 0 2.199-3.398 6.463-5.064z"
    />
  </svg>
);
export default SvgChooseOn;
