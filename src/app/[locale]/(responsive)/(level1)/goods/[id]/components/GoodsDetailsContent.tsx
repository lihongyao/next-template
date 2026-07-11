import { use } from 'react';

import type { GoodsDetails } from '../types';
import GoodsDetailsView from './GoodsDetailsView';

type GoodsDetailsContentProps = {
  detailsPromise: Promise<GoodsDetails>;
};

export default function GoodsDetailsContent({ detailsPromise }: GoodsDetailsContentProps) {
  const details = use(detailsPromise);
  return <GoodsDetailsView details={details} />;
}
