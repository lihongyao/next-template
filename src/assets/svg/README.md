# SVG 资源说明

本目录用于管理项目内的 SVG 图标资源、生成产物，以及和后台前端组同步的可配置图标。

## 处理流程

执行 `pnpm gen-svg` 后，会按下面的顺序处理：

1. 读取 `source/sprites/critical` 下的单色图标，生成 `public/sprite-critical.<hash>.svg`
2. 基于最终的 `sprite-critical.<hash>.svg` 生成 `generated/sprite-svg.tsx`
3. 读取 `source/sprites/normal` 下的单色图标，生成 `public/sprite-normal.<hash>.svg`
4. 读取 `source/svgrs` 下的 SVG，生成 `generated/*.tsx`
5. 生成统一类型定义 `generated/svgPath_all.ts`
6. 生成统一注册表 `generated/index.ts`
7. 业务通过 `@/components/ui/Icon` 统一渲染 icon

说明：

- `critical sprite` 和 `normal sprite` 产物都会输出到 `public/`
- `svgr` 产物、inline sprite 组件、类型、注册表都会输出到 `src/assets/svg/generated/`
- `sprite` 预览页会输出到 `public/sprite-preview.html`

## 目录说明

### `source/sprites/critical`

用于维护需要 inline 的首屏关键单色图标。

适用场景：

- 纯色图标
- 小尺寸图标
- 首屏关键、闪烁敏感的图标
- 例如：tab、header、侧边菜单、首屏导航类 icon

构建结果：

- 写入 `public/sprite-critical.<hash>.svg`
- 写入 `generated/sprite-svg.tsx`
- 在 `generated/index.ts` 中登记为 `sprite-inline`

当前运行时策略：

- `layout` 会注入 `generated/sprite-svg.tsx`
- `Icon` 组件中的这类图标，会通过页内 `#icon-xxx` 引用 symbol
- 这样做的主要目的，是避免在浏览器禁用缓存、强刷、或首屏资源较慢时，图标出现“从无到有闪一下”的问题

### `source/sprites/normal`

用于维护继续走外链 sprite 的普通单色图标。

适用场景：

- 纯色图标
- 小尺寸图标
- 不是首屏关键，但有复用价值的图标
- 例如：列表内部图标、组件内通用箭头、消息状态图标、长尾业务图标

构建结果：

- 写入 `public/sprite-normal.<hash>.svg`
- 在 `generated/index.ts` 中登记为 `sprite-external`

额外说明：

- `public/sprite-critical.<hash>.svg` 和 `public/sprite-normal.<hash>.svg` 都会继续生成，用于预览页、调试，以及必要时切换渲染策略
- inline sprite 生成时，会自动给每个 symbol 内部的 `mask` / `clipPath` / `linearGradient` 等引用型 `id` 加前缀，避免整份 sprite 注入同一个 DOM 后发生冲突

### `source/svgrs`

用于维护走 SVGR 生成 React 组件的图标。

适用场景：

- 多色图标
- 带 `mask` / `clipPath` / `gradient` / `defs` 的图标
- 后续可能接入皮肤变量、需要手动维护颜色的图标

当前团队约定：

- `source/svgrs` 默认保留设计稿原始颜色
- 若后续需要接多皮肤，请直接手动调整对应的 `generated/*.tsx`
- 当前不会在生成时自动把颜色统一改成 `currentColor`
- 如未来需要恢复这类能力，可参考 `scripts/gen-svg/optimize-svgo.ts` 中已注释保留的配置

构建结果：

- 写入 `generated/*.tsx`
- 在 `generated/index.ts` 中登记为 `svgr`

额外说明：

- 对包含 `mask` / `clipPath` / `linearGradient` 等引用型 `id` 的图标，生成后的组件会自动使用 `useId()` 处理，避免同页多次渲染时发生 `id` 冲突

### `source/configurable-icons`

该目录用于和后台前端组同步“可配置图标”资源。

说明：

- 该目录下的 SVG 必须来源于 `source/sprites/critical`、`source/sprites/normal` 或 `source/svgrs`
- 不要放未纳入主图标体系的临时文件
- 后台配置所使用的 icon，应由开发从 `source/sprites/critical`、`source/sprites/normal`、`source/svgrs` 中挑选后复制到这里
- 后续可以直接把该目录交给后台前端开发人员使用

注意：

- `configurable-icons` 本身不是构建入口
- 如果这里只加文件，但 `source/sprites/critical`、`source/sprites/normal`、`source/svgrs` 中没有对应图标，前端不会展示

### `generated`

该目录用于存放 SVG 生成产物。

当前包含：

- `*.tsx`：由 `source/svgrs` 生成的 React 组件
- `sprite-svg.tsx`：由最终 `sprite-critical.<hash>.svg` 转换得到的 inline sprite source 组件
- `svgPath_all.ts`：统一的 icon 名称类型
- `index.ts`：统一的组件映射、sprite 映射、sprite 文件路径、类型导出、渲染来源登记

维护规则：

- `generated/index.ts`、`generated/svgPath_all.ts`、`generated/sprite-svg.tsx` 不要手动修改
- `generated/*.tsx` 当前保留“可手动接管”的能力，用于后续皮肤变量维护

## 日常维护方式

### 新增 critical sprite 图标

1. 将 SVG 放入 `source/sprites/critical`
2. 执行 `pnpm gen-svg`
3. 通过 `@/components/ui/Icon` 使用

判定标准：

- 首屏关键、闪烁敏感时，优先放到 `source/sprites/critical`

### 新增 normal sprite 图标

1. 将 SVG 放入 `source/sprites/normal`
2. 执行 `pnpm gen-svg`
3. 通过 `@/components/ui/Icon` 使用

判定标准：

- 如果是单色小图标，但不值得把整套资源提前塞进首屏 HTML，就放到 `source/sprites/normal`

### 新增 svgr 图标

1. 将 SVG 放入 `source/svgrs`
2. 执行 `pnpm gen-svg`
3. 如需皮肤变量，再手动调整对应的 `generated/*.tsx`

### 修改已有 svgr 图标源文件

当前 `svgr` 生成逻辑是增量模式：

- 如果 `generated/*.tsx` 已存在，默认不会覆盖
- 这是一条有意保留的团队约定，用来保护手动维护的皮肤变量逻辑

如果你希望“重新按最新 SVG 生成”：

1. 删除对应的 `generated/<icon>.tsx`
2. 执行 `pnpm gen-svg`

### 删除图标

- 从 `source/sprites/critical`、`source/sprites/normal` 或 `source/svgrs` 删除源文件
- 重新执行 `pnpm gen-svg`
- 对应的类型和注册表会同步更新
- `svgr` 已不存在源文件时，对应的 `generated/*.tsx` 会自动删除

## 统一使用方式

业务层统一通过 `@/components/ui/Icon` 使用图标。

类型统一从下面的生成入口获取：

```ts
import type { SvgPathName } from '@/assets/svg/generated';
```

常见用法：

```tsx
<Icon name='home' className='size-6' />
<Icon name='close' className='size-4' />
```

当前 sprite 图标的运行时渲染方式：

- `critical sprite`：`layout` 中会注入一次 `SpriteSvgSource`，`Icon` 渲染时使用 `href="#icon-xxx"`
- `normal sprite`：`Icon` 渲染时使用外链 `sprite-normal.<hash>.svg#icon-xxx`
- 因此业务层不需要区分“当前是 inline sprite 还是外链 sprite”，仍然只传 `name`

## 切回外链 Sprite

如果以后希望从“critical inline + normal external”的混合方案，切回“全部通过外链 sprite 文件访问”的方案，可按下面步骤恢复：

1. 将 `source/sprites/critical` 中的图标迁回 `source/sprites/normal`
2. 在 `src/app/[locale]/layout.tsx` 中移除 `SpriteSvgSource` 的 import 和注入
3. 在 `src/components/ui/Icon/index.tsx` 中，移除 `sprite-inline` 分支，只保留外链 sprite 渲染
4. 在 `scripts/gen-svg/index.ts` 中移除 `generateInlineSpriteTsx(...)` 的调用
5. 如不再需要 inline sprite 产物，可删除 `scripts/gen-svg/generate-inline-sprite.ts` 和 `generated/sprite-svg.tsx`
6. 重新执行 `pnpm gen-svg`

切回后说明：

- 浏览器会重新依赖外链 `sprite-normal.<hash>.svg` 来显示这批图标
- 配合 `Cache-Control: public, max-age=31536000, immutable` 时，正常缓存场景下问题不大
- 但在禁用缓存、强刷、或首屏网络较慢时，更容易出现 sprite 图标晚于页面内容出现的闪烁现象

## 注意事项

- `source/sprites` 和 `source/svgrs` 之间不允许同名图标，否则生成会直接报错
- `generated/index.ts` 中已经统一声明了每个图标是走 `sprite` 还是 `svgr`
- `public/sprite-preview.html` 可用于查看当前 sprite 图标集合
- `source` 目录下不要放无关文件，尤其不要提交临时资源
