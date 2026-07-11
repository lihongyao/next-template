import type { ApiRequestOptions } from './core';
import { createApiMethodHelpers } from './methods';

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
export const { get, post, put, patch, del } = createApiMethodHelpers(api);
