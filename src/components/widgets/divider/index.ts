import type { WidgetConfig } from '../types';

export default {
  type: 'divider',
  async getData(payload) {
    return {
      data: { component: payload.component },
    };
  },
} satisfies WidgetConfig;
