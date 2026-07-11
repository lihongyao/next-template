export type GoodsReview = {
  comment: string;
  date: string;
  rating: number;
  reviewerEmail: string;
  reviewerName: string;
};

export type GoodsDimensions = {
  depth: number;
  height: number;
  width: number;
};

export type GoodsMeta = {
  barcode: string;
  createdAt: string;
  qrCode: string;
  updatedAt: string;
};

export type GoodsDetails = {
  availabilityStatus: string;
  brand?: string;
  category: string;
  description: string;
  dimensions?: GoodsDimensions;
  discountPercentage?: number;
  id: number;
  images: string[];
  meta?: GoodsMeta;
  minimumOrderQuantity?: number;
  price: number;
  rating?: number;
  returnPolicy?: string;
  reviews: GoodsReview[];
  shippingInformation?: string;
  sku?: string;
  stock?: number;
  tags?: string[];
  thumbnail?: string;
  title: string;
  warrantyInformation?: string;
  weight?: number;
};
