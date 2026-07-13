import type { ApiRequestOptions } from './core';

type RuntimeApi = <T = unknown>(input: string, options?: ApiRequestOptions) => Promise<T>;

let serverApiPromise: Promise<RuntimeApi> | undefined;
let clientApiPromise: Promise<RuntimeApi> | undefined;

/** 按当前运行时加载对应入口，避免 client bundle 直接带上 server 代码。 */
function loadRuntimeApi(): Promise<RuntimeApi> {
  if (typeof window === 'undefined') {
    serverApiPromise ??= import('./server').then(({ serverApi }) => serverApi);
    return serverApiPromise;
  }

  clientApiPromise ??= import('./client').then(({ clientApi }) => clientApi);
  return clientApiPromise;
}

/** 自动选择 serverApi 或 clientApi 的请求入口。 */
async function runtimeApi<T = unknown>(input: string, options: ApiRequestOptions = {}): Promise<T> {
  const request = await loadRuntimeApi();
  return request<T>(input, options);
}

export const api = runtimeApi;

/** GET 请求不接收 body，请用 params 传查询参数。 */
export function get<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'GET' });
}

/** POST 请求。 */
export function post<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'POST' });
}

/** PUT 请求。 */
export function put<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'PUT' });
}

/** PATCH 请求。 */
export function patch<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'PATCH' });
}

/** DELETE 请求不接收 body，请用 params 传查询参数。 */
export function del<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return api<T>(input, { ...options, method: 'DELETE' });
}
