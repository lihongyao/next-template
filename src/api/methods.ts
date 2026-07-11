import type { ApiRequestOptions } from './core';

type RuntimeApi = <T = unknown>(input: string, options?: ApiRequestOptions) => Promise<T>;
type GetLikeOptions = Omit<ApiRequestOptions, 'method' | 'body'>;
type BodyLikeOptions = Omit<ApiRequestOptions, 'method'>;

export function createApiMethodHelpers(request: RuntimeApi) {
  return {
    get<T = unknown>(input: string, options?: GetLikeOptions): Promise<T> {
      return request<T>(input, { ...options, method: 'GET' });
    },

    post<T = unknown>(input: string, options?: BodyLikeOptions): Promise<T> {
      return request<T>(input, { ...options, method: 'POST' });
    },

    put<T = unknown>(input: string, options?: BodyLikeOptions): Promise<T> {
      return request<T>(input, { ...options, method: 'PUT' });
    },

    patch<T = unknown>(input: string, options?: BodyLikeOptions): Promise<T> {
      return request<T>(input, { ...options, method: 'PATCH' });
    },

    del<T = unknown>(input: string, options?: GetLikeOptions): Promise<T> {
      return request<T>(input, { ...options, method: 'DELETE' });
    },
  };
}
