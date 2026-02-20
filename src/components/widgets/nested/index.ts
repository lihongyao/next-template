import type { ComponentInfo } from '@/types';

import type { GetDataPayload, WidgetConfig } from '../types';

export interface NestedProps {
  component: ComponentInfo;
}
export default {
  type: 'nested',
  getData: async (payload: GetDataPayload) => {
    return {
      data: { component: payload.component },
    };
  },
} satisfies WidgetConfig<NestedProps>;
