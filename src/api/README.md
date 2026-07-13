# API 请求层

这个目录封装 Next.js App Router 项目的后端接口请求。

## 目录结构

- `core.ts`: 运行时无关的类型、token 编解码、响应解析、重试和超时。
- `server.ts`: 服务端 Cookie 访问和服务端请求辅助函数。
- `client.ts`: 客户端 token 辅助函数、刷新流程和客户端请求辅助函数。
- `fetch.ts`: 按运行时自动分发的兼容入口。
- `modules/*`: 按业务领域组织的接口函数。

## 调用入口

- `@/api/modules`: 业务优先入口。按领域导入业务函数，避免在组件里散落后端路径。
- `@/api/fetch` 的 `api` / `get` / `post`: 自动运行时入口，会根据当前运行时分发到 `serverApi` 或 `clientApi`。
- `@/api/server` 的 `serverApi` / `serverGet`: 显式服务端入口，用在 Server Components、Route Handlers 和 Server Functions。
- `@/api/client` 的 `clientApi` / `clientGet`: 显式客户端入口，用在明确需要客户端直连接口的客户端代码。
- `@/api`: 公共聚合入口，只导出类型、`ApiError`、`ErrorCode`、自动运行时入口和 `modules`。需要明确 server/client 能力时，直接导入 `@/api/server` 或 `@/api/client`。

业务代码通常这样使用：

```ts
import { product } from '@/api/modules';

const data = await product.list();
```

确实需要绕过领域模块时，再使用运行时入口：

```ts
import { serverGet } from '@/api/server';

const data = await serverGet('/products', { next: { revalidate: 60 } });
```

`baseFetch()` 是底层执行器，主要供 `serverApi()`、`clientApi()` 和自动运行时入口复用。业务代码不建议直接依赖它。

## 鉴权

请求默认都是公开请求，不会读取 Cookie。

可按需要显式声明鉴权模式：

```ts
await get('/user/profile', { auth: 'required' });
await get('/feed', { auth: 'optional' });
await get('/products', { auth: 'none' });
```

私有请求会强制使用 `cache: 'no-store'`。

推荐按数据性质拆分：

```ts
// 公开数据：优先服务端请求，并使用 Next fetch 缓存。
await serverGet('/products', { next: { revalidate: 60, tags: ['products'] } });

// 私有首屏数据：仍然可以服务端请求，但一定是动态数据。
await serverGet('/user/profile', { auth: 'required' });

// 交互触发的数据：不参与首屏渲染，或强依赖本地 UI 状态时，使用客户端请求。
await clientGet('/notifications', { auth: 'required' });
```

生产鉴权优先通过 Route Handlers 或 Server Functions 调用
`setServerToken()` / `clearServerToken()`，让 token 存在 HttpOnly Cookie 中。
`setClientToken()` 只是为客户端直连鉴权保留的过渡期辅助函数。

客户端请求遇到后端业务码 `TOKEN_EXPIRED` 时会单飞刷新 token，并重试当前请求一次。刷新重试状态是内部实现，不暴露在 `ApiRequestOptions` 中。

客户端请求最终失败时会派发全局错误事件，`ClientInitializer` 会统一弹错误提示。

## 响应解析

默认响应模式是 `base-response`，期望后端返回：

```ts
type BaseResponse<T> = {
  code: number;
  data: T;
};
```

解析顺序：

- HTTP 非 2xx 会先进入错误路径，不会因为响应体里的 `code: 0` 被误判成功。
- `base-response` 模式下，HTTP 2xx 必须是合法 JSON，且包含数字类型的 `code`。
- `responseMode: 'json'` 返回原始 JSON；HTTP 2xx 但空响应或非法 JSON 会抛出“响应格式异常”，`204` 除外。
- `responseMode: 'text'` 返回文本；非 2xx 会抛出 `ApiError`。
- `responseMode: 'response'` 返回原始 `Response`，由调用方自行读取 body。

示例：

```ts
await get('/products', { responseMode: 'json' });
await get('/health', { responseMode: 'text' });
```

## 错误提示

客户端请求默认会走全局错误提示。提示文案优先读取 `message.error_${code}`，
没有对应翻译时使用 `ApiError.message`。

如果某个业务要自己处理错误，传 `errorToast: false`，然后在调用处 `try/catch`：

```ts
import { ApiError } from '@/api';
import { clientPost } from '@/api/client';

try {
  await clientPost('/order/create', {
    auth: 'required',
    body: { productId },
    errorToast: false,
  });
} catch (error) {
  if (error instanceof ApiError) {
    // 这里按业务处理，比如设置表单错误、打开弹窗或展示页面错误态。
    // error.code 是后端错误码；error.data 是后端返回的错误参数。
    return;
  }

  throw error;
}
```

需要变量插值的错误码在 `src/libs/error.ts` 里维护。命中后会按错误码单独从
`error.data` 里取字段，普通错误码不会传插值参数。

## 缓存

公开服务端请求可以接入 Next fetch 缓存：

```ts
await get('/products', {
  next: {
    revalidate: 60,
    tags: ['products'],
  },
});
```

动态公开数据使用 `cache: 'no-store'`。不要通过请求头里的 `Vary` 或
`Cache-Control` 控制 Next Data Cache，应该直接传 fetch 配置。

## 请求参数

GET 和 HEAD 请求不允许传 `body`，请使用 `params` 传查询参数：

```ts
await get('/products', {
  params: { page: 1, keyword: 'phone' },
});
```

非 GET/HEAD 请求传普通对象时，会自动序列化为 JSON，并在没有显式
`Content-Type` 时补上 `application/json`。`FormData`、`Blob`、`URLSearchParams`
等原生 `BodyInit` 会按原样传给 `fetch`，用于上传或表单提交等场景。

## 超时

服务端请求默认不创建 `AbortController`，以保留 Next 服务端 fetch 记忆化能力。
只有确实需要超时控制的请求才传入 `timeout`。客户端请求默认使用配置里的客户端超时时间。
