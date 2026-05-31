# SDK Manager

当前只内置 `JsBridgeSDK`，用于原生 App 嵌套 H5 时和壳包通信。Manager 负责统一注册、初始化状态、初始化期间的上报队列，以及未来新增 SDK 时的公共生命周期约束。

## 使用

一般在客户端入口初始化一次：

```ts
import { SDKName, bootstrapSDK } from '@/libs/sdk-manager';

await bootstrapSDK({
  debug: process.env.NODE_ENV === 'development',
  config: {
    [SDKName.JsBridge]: {
      onLoaded: () => {
        console.log('[JsBridgeSDK] loaded');
      },
      pollIntervalMs: 200,
      timeoutMs: 6000,
    },
  },
});
```

上报统一走 `sdkManager.report`：

```ts
import { sdkManager } from '@/libs/sdk-manager';

sdkManager.report('page_view', { page: '/home' });
```

如果页面刚进入时就调用了 `report`，但原生 `jsBridge` / `ReactNativeWebView` / `webkit.messageHandlers.jsBridge` 还没有注入完成，事件会先进入 Manager 队列。`JsBridgeSDK.init` 会轮询等待桥接挂载，ready 后 Manager 再按顺序补发队列；初始化期间产生的 report 不做数量截断。

## JsBridge 配置

```ts
type JsBridgeSDKConfig = {
  onLoaded?: () => void;
  pollIntervalMs?: number; // 默认 200
  timeoutMs?: number; // 默认 6000
};
```

- `pollIntervalMs`：检测原生桥是否注入的间隔。
- `timeoutMs`：最长等待时间。超时后该 SDK 仍然不是 ready，队列里的上报会被刷新，但因为没有 ready 的上报 SDK，事件会被丢弃。
- `onLoaded`：桥接 ready 后触发，异常会被捕获，不会影响 Manager。

## 调试

```ts
import { SDKName, sdkManager } from '@/libs/sdk-manager';

sdkManager.getSDK(SDKName.JsBridge)?.isReady;
sdkManager.getRegisteredSDKs();
```

业务上只关心 SDK 是否 ready；`isReady === true` 表示可以上报或调用桥接方法。

## 目录

```txt
libs/sdk-manager/
├── core/           # BaseSDK、SDKManager、类型、bootstrap
├── providers/      # 当前只有 JsBridgeSDK
├── index.ts
└── README.md
```

## 后续新增 SDK 约束

1. 在 `providers/` 下新增 provider，继承 `BaseSDK`。
2. 在 `core/types.ts` 里补充 `SDKName`、`SDKConfigMap`、`SDKInstanceMap`。
3. 在 `core/bootstrap.ts` 里注册实例。
4. `init` 必须返回可等待结果：同步初始化可以直接 `markReady()`，异步初始化必须返回 `Promise`，并在 ready 时调用 `markReady()`，失败或超时时 reject。
5. 需要统一上报能力时实现 `IReportSDK.report`。Manager 只会向 `ready` 且支持 `report` 的 SDK 分发事件。

这条约束很重要：不要在 provider 里启动异步初始化后立刻返回 `void`，否则 Manager 会误判初始化完成，首屏早期上报可能丢失。
