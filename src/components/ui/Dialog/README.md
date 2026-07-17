# 概述

为了让弹窗的使用方式更统一、可控，项目中封装了一套全局 Dialog。它支持多种调用方式，既能满足简单弹窗的快速使用，也能支撑复杂的业务弹窗管理。

# 核心能力

- 提供完整的弹窗动画与生命周期管理
- 内置 body 滚动锁，支持多弹窗叠加
- 支持受控 / 非受控两种调用方式
- 支持遮罩关闭与自动销毁
- 关闭流程 Promise 化，便于流程编排
- 支持单例 / 多实例弹窗策略
- 支持队列式弹窗展示
- 与路由状态联动，自动处理回退场景
- Provider 管理的强类型业务弹窗体系

# 文件结构

```
Dialog/
├── index.tsx      # 主组件、静态方法、Provider、useDialog
├── animate.css    # 动画样式（fade/zoom/slide）
└── README.md
```

# 设计理念

在使用前，建议先了解以下设计原则，这些原则直接影响弹窗的使用方式与行为预期。

1️⃣ 动画与销毁解耦

弹窗的“关闭”并不等同于立即卸载组件。

在本实现中，**所有弹窗都会先执行退出动画，动画结束后才移除 DOM**，从而保证：

- 动画完整播放
- 不出现闪烁或布局抖动
- 关闭完成时机可被准确感知

2️⃣ 关闭流程 Promise 化

弹窗关闭本身是一个异步过程，因此在设计上将其作为 Promise 处理。

```TypeScript
await dialog.close();
await Dialog.open(...).close();
await dialog.queue(...);
```

这使得：

- 串行交互逻辑更自然
- 不需要额外的回调或状态判断
- 动画完成时机可以被精确控制

3️⃣ Provider + 静态 API 并存

- 业务弹窗：使用 DialogProvider + useDialog
  - 统一管理
  - 强类型约束
  - 更适合复杂业务场景
- 工具 / 临时弹窗：使用 Dialog.open
  - 调用简单
  - 不依赖组件状态
  - 适合一次性使用

两种方式并存，避免为简单场景引入不必要的复杂度。

4️⃣ 强类型注册，而不是 magic string

所有业务弹窗都通过 dialogRegistry 统一注册：

- 弹窗类型具备完整类型提示
- props 在编译期即可校验
- 避免字符串拼写错误或参数传错

在保证灵活性的同时，提高了整体的可维护性和可重构性。

# API 参考

## DialogProps

```ts
interface DialogProps {
  /** 类名 - 遮罩 */
  maskClassName?: string;
  /** 类名 - 内容 */
  contentClassName?: string;
  /** 弹框是否打开（受控模式，仅作为组件调用时有效） */
  open?: boolean;
  /** 弹框层级，默认4000 */
  zIndex?: number;
  /** 弹框内容 */
  children: ReactNode;
  /** 是否允许点击遮罩关闭，默认true */
  maskClosable?: boolean;
  /** 自动销毁，单位：秒。到达时间后自动触发关闭 */
  autoDestroy?: number;
  /** 进入动画，默认zoom-in */
  enterAnimation?: DialogEnterAnimation;
  /** 退出动画，默认zoom-out */
  exitAnimation?: DialogExitAnimation;
  /** 是否允许同一类型 Dialog 同时打开多个实例（仅 Provider 模式有效） */
  multiple?: boolean;

  /** 用户意图关闭（仅受控模式触发） */
  onClose?: () => void;
  /** 弹窗完全关闭后触发（任何模式） */
  onAfterClose?: (event: DialogAfterCloseEvent) => void;

  /** 路由前进/后退时是否自动关闭，默认true */
  closeOnPopstate?: boolean;
}
```

## DialogRef

组件支持 `forwardRef`，用于 imperative 控制关闭：

```ts
interface DialogRef {
  setIsExiting: (reason?: DialogCloseReason) => void;
}
```

```tsx
const dialogRef = useRef<DialogRef>(null);

<Dialog ref={dialogRef} open={open} onClose={() => setOpen(false)}>
  <div>内容</div>
</Dialog>;

// 程序化关闭
dialogRef.current?.setIsExiting('manual');
```

## DialogCloseReason

```ts
type DialogBuiltInCloseReason =
  | 'manual' // 手动关闭（调用 close / requestClose）
  | 'mask' // 点击遮罩
  | 'autoDestroy' // 定时自动关闭
  | 'popstate'; // 路由返回

type DialogCloseReason = DialogBuiltInCloseReason | (string & Record<never, never>); // 自定义业务关闭原因

type DialogCloseOptions = {
  reason?: DialogCloseReason;
};
```

## DialogAfterCloseEvent

```ts
type DialogAfterCloseEvent = {
  reason: DialogCloseReason;
  stayDurationMs: number;
};
```

> 提示：所有关闭方式都会最终进入 `onAfterClose(event)`，方便统一处理埋点、回收逻辑。

## DialogEnterAnimation / DialogExitAnimation

```ts
type DialogEnterAnimation = 'fade-in' | 'zoom-in' | 'slide-up-in' | 'slide-right-in';
type DialogExitAnimation = 'fade-out' | 'zoom-out' | 'slide-up-out' | 'slide-right-out';
```

动画样式定义在 `animate.css` 中，遮罩层固定使用 `fade-in` / `fade-out`。

# 调用方式

## 1️⃣ 组件模式

页面 / 局部弹窗

适合 **页面级、局部控制** 的弹窗。

**受控模式：** 传入 `open` 时，由父组件控制开关：

```tsx
'use client';
import { useState } from 'react';

import { Dialog } from '@/components/ui/Dialog';

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onAfterClose={({ reason, stayDurationMs }) =>
          console.log('关闭完成', reason, stayDurationMs)
        }
      >
        <div className="rounded bg-white p-6">
          <p>内容</p>
          <button onClick={() => setOpen(false)}>关闭</button>
        </div>
      </Dialog>
    </>
  );
}
```

**非受控模式：** 不传 `open` 时，组件内部管理状态，首次渲染即显示，关闭后 unmount：

```tsx
<Dialog onAfterClose={({ reason, stayDurationMs }) => console.log(reason, stayDurationMs)}>
  <div className="rounded bg-white p-6">内容</div>
</Dialog>
```

特点：

- 受控 / 非受控可选
- 生命周期清晰
- 适合局部 UI 弹窗

## 2️⃣ 静态方法

一次性 / 工具弹窗

适合 **无需 React 状态、临时弹窗**：

```tsx
import { Dialog } from '@/components/ui/Dialog';

const { key, close } = Dialog.open({
  content: (
    <div className="bg-white p-6">
      <p>Hello Dialog</p>
      <button onClick={() => close()}>关闭</button>
    </div>
  ),
  maskClosable: false,
  autoDestroy: 3, // 3 秒后自动关闭
  onAfterClose({ reason, stayDurationMs }) {
    console.log('关闭原因:', reason, '停留时长:', stayDurationMs);
  },
});
```

**返回值：**

```ts
{
  key: string; // 实例唯一标识
  close: (options?: DialogCloseOptions) => Promise<void>; // 关闭并等待动画结束
}
```

**关闭控制：**

```tsx
await close(); // 关闭当前实例，等待动画结束
Dialog.close(key); // 关闭指定实例
Dialog.close(); // 关闭所有静态方法打开的弹窗

await close({ reason: 'confirmed' }); // 使用自定义原因关闭当前实例
await Dialog.close(key, { reason: 'cancel-button' }); // 使用自定义原因关闭指定实例
```

**说明：** 静态方法打开的弹窗由 `createPortal` 渲染到 `document.body`，`zIndex` 从 4000 起自增；`closeOnPopstate` 默认生效，路由后退时会自动关闭。

特点：

- 不依赖 state
- 用完即走
- 非业务型弹窗首选

## 3️⃣ Provider 模式 🔥

业务弹窗，推荐

这是 **项目中最常用、最推荐** 的方式。

### ⭕️ 接入流程

1️⃣ 编写弹窗组件

```tsx
// components/features/dialogs/UserDialog.tsx
export default function UserDialog({ userId }: { userId: number }) {
  return <div>用户：{userId}</div>;
}
```

2️⃣ 注册弹框

```tsx
// components/features/dialogs/index.ts
import ConfirmDialog from './ConfirmDialog';
import UserDialog from './UserDialog';

export const dialogRegistry = {
  user: UserDialog,
  confirm: ConfirmDialog,
} as const;
```

3️⃣ 挂载 DialogProvider（全局一次）

```tsx
// app/layout.tsx
import { DialogProvider } from '@/components/ui/Dialog';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
```

4️⃣ useDialog 打开弹窗

```tsx
import { useDialog } from '@/components/ui/Dialog';

const dialog = useDialog();

dialog.open('user', {
  props: {
    userId: 1,
  },
});
```

**在非 Provider 子树中访问：** 若需要在非 `DialogProvider` 子组件中打开弹窗（如 store、utils、事件回调），可使用 `getGlobalDialog()`：

```tsx
import { getGlobalDialog } from '@/components/ui/Dialog';

// 需确保 DialogProvider 已挂载
const dialog = getGlobalDialog();
dialog.open('confirm', { props: { title: '确认' } });
```

### ⭕️ props 初始化与更新

`props` 支持对象或函数形式，函数可基于 `prev` 计算新值：

```tsx
// 对象形式
dialog.open('user', { props: { userId: 1 } });

// 函数形式（prev 为 null 表示首次打开）
dialog.open('user', {
  props: (prev) => ({
    userId: prev ? prev.userId + 1 : 1,
  }),
});
```

### ⭕️ 单例 vs. 多实例

默认：**同类型只存在一个**

```tsx
dialog.open('user', { props: { userId: 1 } });
dialog.open('user', { props: { userId: 2 } });
```

> 提示：不会新建，而是 updateProps。

允许多实例：

```tsx
dialog.open('user', {
  multiple: true,
  props: { userId: 1 },
});
```

### ⭕️ DialogInstance 与 updateProps

`open()` 返回的实例包含：

```ts
type DialogInstance<K> = {
  key: string;
  type: K;
  zIndex: number;
  closeOnPopstate: boolean;
  props: PropsOf<K>;
  requestClose: () => void; // 触发关闭
  updateProps: (updater) => void; // 更新 props
};
```

**updateProps** 动态更新内容，特别适合在弹窗显示时，接收到通知需更新 props 的场景：

```tsx
const instance = dialog.open('user', { props: { userId: 1 } });

// 对象形式
dialog.updateProps('user', { userId: 3 });

// 函数形式
dialog.updateProps('user', (prev) => ({
  ...prev,
  userId: (prev?.userId ?? 0) + 1,
}));
```

### ⭕️ 队列弹窗（严格串行）

适用于首页弹窗

```tsx
await dialog.queue('confirm', { props: { title: '第一步' } });
await dialog.queue('confirm', { props: { title: '第二步' } });
```

> 提示：后一个弹窗 **一定等前一个完全关闭（动画结束）** 才会出现。

### ⭕️ 关闭控制

```tsx
dialog.closeTop(); // 关闭最上层
await dialog.close('confirm'); // 关闭指定类型
await dialog.close(); // 关闭全部

dialog.closeTop({ reason: 'cancel-button' }); // 使用自定义原因关闭最上层
await dialog.close('confirm', { reason: 'confirmed' }); // 使用自定义原因关闭
```

### ⭕️ 路由联动

默认行为：

- 浏览器前进 / 后退
- 自动关闭所有 closeOnPopstate = true 的弹窗

禁用：

```tsx
dialog.open('confirm', {
  closeOnPopstate: false,
});
```

### ⭕️ 动画说明

支持动画：

- 进入：fade-in | zoom-in | slide-up-in | slide-right-in
- 退出：fade-out | zoom-out | slide-up-out | slide-right-out

用法一致：

```tsx
<Dialog enterAnimation="zoom-in" exitAnimation="zoom-out" />;

Dialog.open({ enterAnimation: 'fade-in' });

dialog.open('confirm', {
  enterAnimation: 'slide-up-in',
});
```

# useDialog API

```ts
type DialogContextValue = {
  open: <K>(type: K, options?) => DialogInstance<K>;
  queue: <K>(type: K, options?) => Promise<void>;
  updateProps: <K>(type: K, updater) => void;
  closeTop: (options?: DialogCloseOptions) => void;
  close: (type?: DialogType, options?: DialogCloseOptions) => Promise<void>;
};
```

| 方法                         | 说明                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| `open(type, options)`        | 打开弹窗，返回实例；同类型默认单例，传 `multiple: true` 可多实例 |
| `queue(type, options)`       | 队列打开，等前一个完全关闭后再显示                               |
| `updateProps(type, updater)` | 更新指定类型弹窗的 props                                         |
| `closeTop(options?)`         | 关闭最上层弹窗，可传入自定义关闭原因                             |
| `close(type?, options?)`     | 关闭指定类型或全部，可传入自定义关闭原因，返回 Promise           |

# 推荐使用场景

| **场景**        | **推荐方式**               |
| --------------- | -------------------------- |
| 页面局部弹窗    | \<Dialog />                |
| 全局确认 / 提示 | Dialog.open                |
| 复杂业务弹窗    | useDialog + dialogRegistry |
| 串行用户流程    | queue                      |

# 注意事项

1. **DialogProvider 挂载顺序**：`getGlobalDialog()` 需在 `DialogProvider` 挂载后调用，否则会抛错。
2. **动画期间防抖**：进入/退出动画期间会忽略重复的关闭请求，避免动画被打断。
3. **body 滚动锁**：多弹窗叠加时，只有全部关闭后才解锁 body 滚动。
4. **dialogRegistry**：新增业务弹窗需在 `@/components/features/dialogs/index.ts` 中注册，类型会自动推导。
