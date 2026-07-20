import { api } from '../fetch';

export type ProductListItem = {
  availabilityStatus: string;
  brand?: string;
  category: string;
  discountPercentage?: number;
  id: number;
  price: number;
  rating?: number;
  stock?: number;
  thumbnail?: string;
  title: string;
};

export type ProductListResponse = {
  limit: number;
  products: ProductListItem[];
  skip: number;
  total: number;
};

export function list(): Promise<ProductListResponse> {
  return api<ProductListResponse>('/products', {
    auth: 'none',
    next: { revalidate: 60 },
    responseMode: 'json',
  });
}

export function details(id: number) {
  return api<any>(`/products/${id}`, {
    auth: 'none',
    responseMode: 'json',
  });
}
