# API 请求封装

统一的 API 请求封装，自动识别客户端/服务端环境，无需区分调用方式。

## 核心特性

- ✅ **统一 API**：一个函数，自动适配客户端和服务端
- ✅ **自动环境识别**：自动识别客户端/服务端环境
- ✅ **Token 统一存储**：客户端和服务端都从 Cookie 读取 token（2026 最佳实践）
- ✅ **Token 自动刷新**：客户端支持自动刷新 token
- ✅ **CDN 缓存防护**：自动防止 CDN 缓存包含认证信息的响应
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **请求重试**：指数退避策略
- ✅ **超时控制**：AbortController

## 快速开始

### 基础使用

```ts
import { api } from '@/api';

// 客户端或服务端都可以使用
const user = await api<User>('/users/1');
```

### 客户端组件

```ts
'use client';
import { api } from '@/api';

export default async function ClientComponent() {
  // 自动从 Cookie 读取 token
  const user = await api('/users/1');
  return <div>{user.name}</div>;
}
```

### 服务端组件

```ts
import { api } from '@/api';
import { headers } from 'next/headers';

export default async function ServerComponent() {
  // 传入 headers 以获取 cookie 中的 token
  const serverHeaders = await headers();
  const user = await api('/users/1', { serverHeaders });
  return <div>{user.name}</div>;
}
```

### 便捷方法

```ts
import { del, get, patch, post, put } from '@/api';

// GET 请求
const users = await get('/users', { params: { page: 1 } });

// POST 请求
const newUser = await post('/users', {
  body: JSON.stringify({ name: 'John' }),
});

// PUT 请求
const updated = await put('/users/1', {
  body: JSON.stringify({ name: 'Jane' }),
});

// DELETE 请求
await del('/users/1');
```

## 高级用法

### 需要登录的接口

```ts
// 如果 isLogin 为 true 且没有 token，会抛出错误
const profile = await api('/user/profile', { isLogin: true });
```

### 跳过认证

```ts
// 某些公开接口不需要 token
const data = await api('/public/data', { skipAuth: true });
```

### 自定义配置

```ts
const result = await api('/users', {
  params: { page: 1 },
  timeout: 10000, // 10 秒超时
  retry: 2, // 重试 2 次
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### 服务端请求（传入 headers）

```ts
import { headers } from 'next/headers';

// 在 Server Component 或 Server Action 中
const serverHeaders = await headers();
const user = await api('/users/1', { serverHeaders });
```

## 模块接口封装

```ts
// api/modules/user.ts
import { get, post } from '@/api';

export interface User {
  id: number;
  name: string;
}

export async function getUserById(id: number, options?: RequestOptions) {
  // 可以在客户端或服务端使用
  return get<User>(`/users/${id}`, options);
}

export async function createUser(data: Omit<User, 'id'>, options?: RequestOptions) {
  return post<User>('/users', {
    ...options,
    body: JSON.stringify(data),
  });
}
```

使用：

```ts
// 客户端组件
'use client';
const user = await getUserById(1);

// 服务端组件
import { headers } from 'next/headers';
const serverHeaders = await headers();
const user = await getUserById(1, { serverHeaders });
```

## 响应格式

API 响应格式：

```ts
interface ApiResponse<T> {
  code: number; // 0 或 200 表示成功
  data: T; // 响应数据
  msg: string; // 响应消息
}
```

函数直接返回 `data`，不需要 `.data`：

```ts
const user = await api<User>('/users/1');
// user 直接是 User 类型
```

## Token 管理

### Token 存储方式

**统一使用 Cookie 存储**（2026 最佳实践）：

- ✅ 客户端和服务端都能读取
- ✅ 自动随请求发送（如果设置了 httpOnly: false）
- ✅ 更安全（可以设置 secure, sameSite 等）
- ✅ 无需维护两套存储逻辑

### Token 格式

```ts
interface TokenData {
  token: string;
  refreshToken: string;
}
```

### 客户端 Token 操作

```ts
import { clearClientToken, getClientToken, setClientToken } from '@/api';

// 获取 token（从 Cookie 读取）
const tokenData = await getClientToken();

// 设置 token（存储到 Cookie）
await setClientToken({
  token: 'access-token',
  refreshToken: 'refresh-token',
});

// 清除 token（删除 Cookie）
await clearClientToken();
```

### Cookie 配置

Token 存储在 Cookie 中，默认配置：

- **过期时间**：30 天
- **Path**：`/`
- **SameSite**：`lax`
- **Secure**：生产环境自动启用

可在 `api/core/token.ts` 中修改配置。

### Token 自动刷新

当收到 `code: 10002` 的错误时，客户端会自动刷新 token 并重试请求：

```ts
// 自动处理，无需手动干预
const data = await api('/protected/resource');
```

## 缓存控制

### 核心原理

**每个用户的 token 是不同的**：

- Token 存储在 Cookie 中，每个用户的 Cookie 是独立的
- 用户 A 的 token 和用户 B 的 token 是不同的
- 所以可以安全地使用缓存，只要使用 `Vary` 头区分不同 token 的响应

**Vary 头的作用**：

- `Vary: Authorization, Cookie` 告诉 CDN：根据不同的 Authorization 和 Cookie 缓存不同的响应
- 用户 A（token: abc）的响应会被缓存为一份
- 用户 B（token: xyz）的响应会被缓存为另一份
- 这样既可以使用缓存提高性能，又能保证每个用户看到正确的数据

### 自动缓存控制（推荐）

API 封装默认使用智能缓存策略：

```ts
// 包含 token 的请求：使用 Vary 头，允许缓存（每个用户的 token 不同，缓存是安全的）
const profile = await api('/user/profile');
// 自动设置：Vary: Authorization, Cookie
// CDN 会根据不同的 token 缓存不同的响应

// 不包含 token 的请求：允许缓存（公开接口）
const news = await api('/public/news', { skipAuth: true });
// 不设置 Vary 头，允许 CDN 缓存
```

### 手动控制

```ts
// 完全禁用缓存（不推荐，除非有特殊需求）
const data = await api('/api/data', { noCache: true });
// 设置：Cache-Control: no-cache, no-store, must-revalidate

// 允许缓存，使用 Vary 头（推荐，默认行为）
const profile = await api('/user/profile', { noCache: false });
// 设置：Vary: Authorization, Cookie
// CDN 会根据不同的 token 缓存不同的响应

// 自动模式（默认，推荐）
const data = await api('/api/data');
// 有 token → 使用 Vary 头，允许缓存
// 无 token → 允许缓存
```

### 使用场景

```ts
// 场景 1：需要认证的接口（默认使用 Vary 头，允许缓存）
const profile = await api('/user/profile', { isLogin: true });
// ✅ 自动设置 Vary: Authorization, Cookie
// ✅ CDN 会根据不同的 token 缓存不同的响应
// ✅ 既安全又高效

// 场景 2：公开接口，需要缓存
const news = await api('/public/news', { skipAuth: true });
// ✅ 允许缓存，提高性能

// 场景 3：完全禁用缓存（特殊场景）
const sensitiveData = await api('/sensitive/data', { noCache: true });
// ⚠️ 完全禁用缓存，确保数据实时性
```

### 缓存控制选项

```ts
interface RequestOptions {
  /**
   * 缓存控制
   * - 'auto'（默认）：智能判断
   *   - 有 token → 使用 Vary 头，允许缓存（每个用户的 token 不同，安全）
   *   - 无 token → 允许缓存（公开接口）
   * - false: 允许缓存，使用 Vary 头区分不同 token
   * - true: 完全禁用缓存
   */
  noCache?: boolean | 'auto';
}
```

### 为什么这样是安全的？

1. **每个用户的 token 不同**：

   ```ts
   // 用户 A
   Cookie: AUTHORIZATION_TOKEN = { token: 'abc123', refreshToken: 'xyz789' };

   // 用户 B
   Cookie: AUTHORIZATION_TOKEN = { token: 'def456', refreshToken: 'uvw012' };
   ```

2. **Vary 头确保分别缓存**：
   - CDN 看到 `Vary: Authorization, Cookie`
   - 用户 A 的请求（token: abc123）→ 缓存响应 A
   - 用户 B 的请求（token: def456）→ 缓存响应 B
   - 两个响应分别缓存，不会混淆

3. **既安全又高效**：
   - ✅ 安全性：每个用户看到自己的数据
   - ✅ 性能：CDN 缓存提高响应速度

### 后端建议

后端应该配合设置缓存头：

```ts
// 需要认证的接口（后端应该返回）
Cache-Control: private, max-age=3600  // 允许缓存 1 小时
Vary: Authorization, Cookie            // 根据 token 区分缓存

// 公开接口（后端可以返回）
Cache-Control: public, max-age=3600    // 允许公共缓存
```

这样可以确保：

- CDN 不会缓存包含认证信息的响应
- 不同用户的响应不会被错误缓存
- 公开接口可以安全地使用缓存提高性能

## 错误处理

### 错误码

```ts
import { ApiError, ErrorCode } from '@/api';

ErrorCode.LOGIN_REQUIRED; // 10001 - 需要登录
ErrorCode.TOKEN_EXPIRED; // 10002 - Token 过期
ErrorCode.UNAUTHORIZED; // 401   - 未授权
ErrorCode.TIMEOUT; // 408   - 请求超时
ErrorCode.SERVER_ERROR; // 500   - 服务器错误
```

### 错误处理示例

```ts
import { ApiError, ErrorCode, api } from '@/api';

try {
  const user = await api('/users/1');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ErrorCode.LOGIN_REQUIRED:
        console.error('请登录');
        break;
      case ErrorCode.TOKEN_EXPIRED:
        console.error('Token 过期');
        break;
      case ErrorCode.UNAUTHORIZED:
        console.error('未授权');
        break;
      case ErrorCode.TIMEOUT:
        console.error('请求超时');
        break;
      default:
        console.error('错误:', error.message);
    }
  }
}
```

## 配置

### 环境变量

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### Token 存储 Key

默认使用 `AUTHORIZATION_TOKEN`，可在 `api/core/config.ts` 中修改。

### Token 刷新接口

默认路径为 `/v1/token/refresh`，可在 `api/core/config.ts` 中修改。

## 最佳实践

### 1. 统一使用 `api` 函数

```ts
// ✅ 推荐：统一使用 api 函数
import { api } from '@/api';

const user = await api('/users/1');
```

### 2. 服务端传入 headers

```ts
// ✅ 推荐：在 Server Component 中传入 headers
import { headers } from 'next/headers';
const serverHeaders = await headers();
const user = await api('/users/1', { serverHeaders });

// ❌ 不推荐：不传入 headers（服务端无法获取 token）
const user = await api('/users/1'); // 服务端请求将不带 token
```

### 3. 模块化封装

```ts
// ✅ 推荐：在 modules/ 目录下封装业务接口
export async function getUserById(id: number, options?: RequestOptions) {
  return get<User>(`/users/${id}`, options);
}

// 使用时传入 options（可选）
const user = await getUserById(1, { serverHeaders });
```

## 架构优势

### 统一 API vs 分离 API

| 特性     | 统一 API（推荐）      | 分离 API              |
| -------- | --------------------- | --------------------- |
| 代码复用 | ✅ 一个函数，所有场景 | ❌ 需要维护两套代码   |
| 使用简单 | ✅ 无需区分环境       | ❌ 需要记住用哪个函数 |
| 类型安全 | ✅ 统一类型           | ✅ 类型安全           |
| 维护成本 | ✅ 低                 | ❌ 高                 |

### 为什么统一 API 更好？

1. **代码复用**：同一个接口可以在客户端和服务端使用，无需重复封装
2. **维护简单**：只需要维护一套代码
3. **使用方便**：一个函数，自动适配所有场景
4. **类型一致**：统一的类型定义，减少类型错误

## 使用示例

### 客户端使用

```ts
'use client';
import { api } from '@/api';

export default async function ClientComponent() {
  // 自动从 Cookie 读取 token
  const user = await api('/users/1');
  return <div>{user.name}</div>;
}
```

### 服务端使用

```ts
import { api } from '@/api';
import { headers } from 'next/headers';

export default async function ServerComponent() {
  // 传入 headers 以获取 cookie 中的 token
  const serverHeaders = await headers();
  const user = await api('/users/1', { serverHeaders });
  return <div>{user.name}</div>;
}
```
