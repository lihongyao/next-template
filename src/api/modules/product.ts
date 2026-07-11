import { api } from '../fetch';

export interface Product {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

export function list() {
  return api<any>('/products', {
    auth: 'none',
    responseMode: 'json',
    revalidate: 60,
  });
}

export function details(id: number) {
  return api<any>(`/products/${id}`, {
    auth: 'none',
    responseMode: 'json',
  });
}
