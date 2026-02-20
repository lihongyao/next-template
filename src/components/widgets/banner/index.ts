import type { GetDataPayload, WidgetConfig } from '../types';

export interface BannerProps {
  title: string;
  banners: string[];
}

export default {
  type: 'banner',
  getData: async (payload: GetDataPayload) => {
    return {
      data: {
        component: payload.component,
        title: 'Banner Component',
        banners: ['A', 'B', 'C'],
      },
    };
  },
} satisfies WidgetConfig<BannerProps>;
