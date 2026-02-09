import { api } from '../fetch';

export function list() {
  return api('/products');
}
