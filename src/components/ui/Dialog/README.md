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

# DialogProps

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
  /** 自动销毁 */
  autoDestroy?: number;
  /** 进入动画，默认zoom-in */
  enterAnimation?: DialogEnterAnimation;
  /** 退出动画，默认zoom-out */
  exitAnimation?: DialogExitAnimation;
  /** 是否允许同一类型 Dialog 同时打开多个实例 */
  multiple?: boolean;

  /** 用户意图关闭（仅受控模式触发） */
  onClose?: () => void;
  /** 弹窗完全关闭后触发（任何模式） */
  onAfterClose?: (reason: DialogCloseReason) => void;

  /** 路由前进/后退时是否自动关闭，默认true */
  closeOnPopstate?: boolean;
}
```

## DialogCloseReason

```ts
type DialogCloseReason =
  | 'manual' // 手动关闭（调用 close）
  | 'mask' // 点击遮罩
  | 'autoDestroy' // 定时自动关闭
  | 'popstate'; // 路由返回
```

> 提示：所有关闭方式都会最终进入 `onAfterClose(reason)`，方便统一处理埋点、回收逻辑。

# 调用方式

## 1️⃣ 组件模式

页面 / 局部弹窗

适合 **页面级、局部控制** 的弹窗，由 open 控制：

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
        onAfterClose={() => console.log('关闭完成')}
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

特点：

- 完全受控
- 生命周期清晰
- 适合局部 UI 弹窗

## 2️⃣ 静态方法

一次性 / 工具弹窗

适合 **无需 React 状态、临时弹窗**：

```tsx
import { Dialog } from '@/components/ui/Dialog';

const dialog = Dialog.open({
  content: (
    <div className="bg-white p-6">
      <p>Hello Dialog</p>
      <button onClick={() => dialog.close()}>关闭</button>
    </div>
  ),
  maskClosable: false,
  onAfterClose(reason) {
    console.log('关闭原因:', reason);
  },
});
```

你可以：

```tsx
Dialog.close(); // 关闭所有
Dialog.close(key); // 关闭指定实例
await dialog.close(); // 等待动画结束
```

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

### ⭕️ updateProps

动态更新内容，特别适合在弹窗显示时，接收到通知，需更新 props 的场景。

```tsx
dialog.updateProps('user', (prev) => ({
  ...prev,
  userId: 3,
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

# 推荐使用场景

| **场景**        | **推荐方式**               |
| --------------- | -------------------------- |
| 页面局部弹窗    | \<Dialog />                |
| 全局确认 / 提示 | Dialog.open                |
| 复杂业务弹窗    | useDialog + dialogRegistry |
| 串行用户流程    | queue                      |
