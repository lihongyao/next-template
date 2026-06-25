import { type SVGProps, useId } from 'react';

const SvgSubtract = (props: SVGProps<SVGSVGElement>) => {
  const idPrefix = useId().replace(/:/g, '');
  const dId = idPrefix + '-d';
  const bId = idPrefix + '-b';
  const cId = idPrefix + '-c';
  const aId = idPrefix + '-a';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 307 148"
      width="1em"
      height="1em"
      {...props}
    >
      <foreignObject width={419} height={259.264} x={-56} y={-56}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            backdropFilter: 'blur(28px)',
            clipPath: 'url(#a)',
            height: '100%',
            width: '100%',
          }}
        />
      </foreignObject>
      <g data-figma-bg-blur-radius={56}>
        <mask id={dId} fill="#fff">
          <path d="M0 4.035C0 1.181 2.902-.76 5.557.288c42.003 16.564 93.2 26.29 148.45 26.29 54.811 0 105.636-9.573 147.449-25.899C304.11-.357 307 1.583 307 4.432v126.832c0 8.837-7.163 16-16 16H16c-8.837 0-16-7.163-16-16z" />
        </mask>
        <path
          fill={`url(#${bId})`}
          d="M0 4.035C0 1.181 2.902-.76 5.557.288c42.003 16.564 93.2 26.29 148.45 26.29 54.811 0 105.636-9.573 147.449-25.899C304.11-.357 307 1.583 307 4.432v126.832c0 8.837-7.163 16-16 16H16c-8.837 0-16-7.163-16-16z"
        />
        <path
          fill={`url(#${cId})`}
          d="M154.007 26.578v1zM307 131.264h1zm-16 16v1zm-275 0v1zm-16-16h-1zM301.456.679l.364.932zM5.557.288l-.366.93c42.13 16.615 93.454 26.36 148.816 26.36v-2C98.87 25.578 47.798 15.87 5.924-.642zm148.45 26.29v1c54.923 0 105.872-9.592 147.813-25.967l-.364-.932-.363-.931c-41.687 16.275-92.386 25.83-147.086 25.83zM307 4.432h-1v126.832h2V4.432zm0 126.832h-1c0 8.285-6.716 15-15 15v2c9.389 0 17-7.611 17-17zm-16 16v-1H16v2h275zm-275 0v-1c-8.284 0-15-6.715-15-15h-2c0 9.389 7.611 17 17 17zm-16-16h1V4.035h-2v127.229zM301.456.679l.364.932c2.01-.785 4.18.69 4.18 2.821h2c0-3.566-3.61-5.971-6.907-4.684zM5.557.288l.367-.93C2.624-1.945-1 .461-1 4.034h2C1 1.9 3.179.425 5.19 1.218z"
          mask={`url(#${dId})`}
        />
      </g>
      <defs>
        <linearGradient
          id={bId}
          x1={153.5}
          x2={153.5}
          y1={0}
          y2={114.156}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.012} stopColor="#31ed87" stopOpacity={0.2} />
          <stop offset={1} stopColor="#fff" stopOpacity={0.03} />
        </linearGradient>
        <linearGradient
          id={cId}
          x1={323.629}
          x2={-19.571}
          y1={57.078}
          y2={57.078}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.13} stopColor="#31ed87" stopOpacity={0.05} />
          <stop offset={0.5} stopColor="#31ed87" />
          <stop offset={0.889} stopColor="#31ed87" stopOpacity={0.05} />
        </linearGradient>
        <clipPath id={aId} transform="translate(56 56)">
          <path d="M0 4.035C0 1.181 2.902-.76 5.557.288c42.003 16.564 93.2 26.29 148.45 26.29 54.811 0 105.636-9.573 147.449-25.899C304.11-.357 307 1.583 307 4.432v126.832c0 8.837-7.163 16-16 16H16c-8.837 0-16-7.163-16-16z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default SvgSubtract;
