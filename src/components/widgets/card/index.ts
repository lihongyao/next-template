import type { GetDataPayload, WidgetConfig } from '../types';

export interface CardProps {
  name: string;
  list: number[];
}

export default {
  type: 'card',
  getData: async (payload: GetDataPayload) => {
    return {
      data: { component: payload.component, name: 'Card Component', list: [1, 2, 3, 4] },
    };
  },
} satisfies WidgetConfig<CardProps>;
