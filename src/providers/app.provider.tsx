'use client';

import type { ComponentProps, ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import ClientInitializer from '@/components/features/ClientInitializer';
import GlobalViewport from '@/components/features/GlobalViewport';
import LogoLoading from '@/components/features/LogoLoading';
import RouteModalRenderer from '@/components/features/RouteModalRenderer';
import { DialogProvider } from '@/components/ui/Dialog';
import { MessageProvider } from '@/components/ui/Message';
import { NotificationProvider } from '@/components/ui/Notification';
import type { BrandConfig } from '@/configs/brands/types';
import { BrandConfigProvider } from '@/providers/brand.provider';
import { DeviceProvider } from '@/providers/device.provider';
import { ModalProvider } from '@/providers/modal.provider';

interface AppProvidersProps {
  children: ReactNode;
  locale: string;
  messages: ComponentProps<typeof NextIntlClientProvider>['messages'];
  brandConfig: BrandConfig;
  userAgent: string;
}

export function AppProviders({
  children,
  locale,
  messages,
  brandConfig,
  userAgent,
}: AppProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <BrandConfigProvider value={brandConfig}>
        <DeviceProvider userAgent={userAgent}>
          <ModalProvider>
            <DialogProvider>
              <NotificationProvider>
                <MessageProvider>
                  <LogoLoading />
                  <ClientInitializer />
                  <RouteModalRenderer />
                  {children}
                  <GlobalViewport />
                </MessageProvider>
              </NotificationProvider>
            </DialogProvider>
          </ModalProvider>
        </DeviceProvider>
      </BrandConfigProvider>
    </NextIntlClientProvider>
  );
}
