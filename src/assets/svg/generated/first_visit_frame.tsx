import { type SVGProps, useId } from 'react';

const SvgFirstVisitFrame = (props: SVGProps<SVGSVGElement>) => {
  const idPrefix = useId().replace(/:/g, '');
  const aId = idPrefix + '-a';
  const bId = idPrefix + '-b';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 310 114"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="#1d1f1d" d="M.5.5h309v113H.5z" />
      <path fill={`url(#${aId})`} fillOpacity={0.2} d="M.5.5h309v113H.5z" />
      <path stroke={`url(#${bId})`} d="M.5.5h309v113H.5z" />
      <defs>
        <radialGradient
          id={aId}
          cx={0}
          cy={0}
          r={1}
          gradientTransform="matrix(0 114 -310 0 155 0)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.197} stopColor="#31ed87" stopOpacity={0.4} />
          <stop offset={0.529} stopColor="#1d1f1d" stopOpacity={0} />
        </radialGradient>
        <linearGradient
          id={bId}
          x1={326.792}
          x2={-19.762}
          y1={57}
          y2={57}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.13} stopColor="#31ed87" stopOpacity={0.05} />
          <stop offset={0.5} stopColor="#31ed87" />
          <stop offset={0.889} stopColor="#31ed87" stopOpacity={0.05} />
        </linearGradient>
      </defs>
    </svg>
  );
};
export default SvgFirstVisitFrame;
