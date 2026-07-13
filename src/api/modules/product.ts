import { api } from '../fetch';

export function list() {
  return api<any>('/products', {
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
