# API 请求层

这个目录封装 Next.js App Router 项目的后端接口请求。

## 目录结构

- `core.ts`: 运行时无关的类型、配置、响应解析、重试、超时，以及 fetch 缓存参数处理。
- `server.ts`: 服务端 Cookie 访问和服务端请求辅助函数。
- `client.ts`: 客户端 token 辅助函数、刷新流程和客户端请求辅助函数。
- `fetch.ts`: 按运行时自动分发的兼容入口。
- `modules/*`: 按业务领域组织的接口函数。

## 调用入口

- `src/api/server` 的 `serverApi` / `serverGet`: 用在 Server Components、Route Handlers 和 Server Functions。
- `src/api/client` 的 `clientApi` / `clientGet`: 用在明确需要客户端直连接口的客户端代码。
- `src/api/fetch` 的 `api` / `get` / `post`: 兼容入口，会根据当前运行时自动分发。
- `modules/*`: 领域 API。优先导入业务函数，避免在业务代码里直接拼接口路径。

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
await serverGet('/products', { revalidate: 60, tags: ['products'] });

// 私有首屏数据：仍然可以服务端请求，但一定是动态数据。
await serverGet('/user/profile', { auth: 'required' });

// 交互触发的数据：不参与首屏渲染，或强依赖本地 UI 状态时，使用客户端请求。
await clientGet('/notifications', { auth: 'required' });
```

生产鉴权优先通过 Route Handlers 或 Server Functions 调用
`setServerToken()` / `clearServerToken()`，让 token 存在 HttpOnly Cookie 中。
`setClientToken()` 只是为客户端直连鉴权保留的过渡期辅助函数。

## 缓存

公开服务端请求可以接入 Next fetch 缓存：

```ts
await get('/products', {
  revalidate: 60,
  tags: ['products'],
});
```

动态公开数据使用 `cache: 'no-store'`。不要通过请求头里的 `Vary` 或
`Cache-Control` 控制 Next Data Cache，应该直接传 fetch 配置。

## 超时

服务端请求默认不创建 `AbortController`，以保留 Next 服务端 fetch 记忆化能力。
只有确实需要超时控制的请求才传入 `timeout`。客户端请求默认使用配置里的客户端超时时间。
