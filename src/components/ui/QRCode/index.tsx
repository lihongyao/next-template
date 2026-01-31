'use client';

import React from 'react';

import QRCode, { QRCodeProps } from 'react-qr-code';

import { cn } from '@/libs/class-helpers';

export interface QrCodeImgProps extends QRCodeProps {
  value: string;
  className?: string;
}

const QRCodeImg = React.forwardRef<HTMLDivElement, QrCodeImgProps>(
  ({ value, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('bg-[#FFF] p-[6px]', className)}>
        <QRCode value={value} style={{ width: '100%', height: '100%' }} {...props} />
      </div>
    );
  },
);

QRCodeImg.displayName = 'QRCodeImg';

export { QRCodeImg };
