import type { GetDataPayload, WidgetConfig } from '../types';

export interface FooterProps {
  text: string;
}
export default {
  type: 'footer',
  getData: async (payload: GetDataPayload) => {
    return {
      data: { component: payload.component, text: 'Footer Component' },
    };
  },
} satisfies WidgetConfig<FooterProps>;
