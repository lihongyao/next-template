import type { ApiRequestOptions } from './core';

type RuntimeApi = <T = unknown>(input: string, options?: ApiRequestOptions) => Promise<T>;

let serverApiPromise: Promise<RuntimeApi> | undefined;
let clientApiPromise: Promise<RuntimeApi> | undefined;

function loadRuntimeApi(): Promise<RuntimeApi> {
  if (typeof window === 'undefined') {
    serverApiPromise ??= import('./server').then(({ serverApi }) => serverApi);
    return serverApiPromise;
  }

  clientApiPromise ??= import('./client').then(({ clientApi }) => clientApi);
  return clientApiPromise;
}

async function runtimeApi<T = unknown>(input: string, options: ApiRequestOptions = {}): Promise<T> {
  const request = await loadRuntimeApi();
  return request<T>(input, options);
}

export const api = runtimeApi;

export function get<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'GET' });
}

export function post<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'POST' });
}

export function put<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'PUT' });
}

export function patch<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'PATCH' });
}

export function del<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'DELETE' });
}
