# SVG 资源说明

本目录用于管理项目内的 SVG 图标资源、生成产物，以及和后台前端组同步的可配置图标。

## 处理流程

执行 `pnpm gen-svg` 后，会按下面的顺序处理：

1. 读取 `source/sprites` 下的单色图标，生成 `public/sprite.<hash>.svg`
2. 读取 `source/svgrs` 下的 SVG，生成 `generated/*.tsx`
3. 生成统一类型定义 `generated/svgPath_all.ts`
4. 生成统一注册表 `generated/index.ts`
5. 业务通过 `@/components/ui/Icon` 统一渲染 icon

说明：

- `sprite` 产物会输出到 `public/`
- `svgr` 产物和类型、注册表都会输出到 `src/assets/svg/generated/`
- `sprite` 预览页会输出到 `public/sprite-preview.html`

## 目录说明

### `source/sprites`

用于维护适合生成 sprite 的图标。

适用场景：

- 纯色图标
- 高频、通用、小尺寸图标
- 希望通过 `color` / `currentColor` 统一控色的图标

构建结果：

- 写入 `public/sprite.<hash>.svg`
- 在 `generated/index.ts` 中登记为 `sprite`

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

- 该目录下的 SVG 必须来源于 `source/sprites` 或 `source/svgrs`
- 不要放未纳入主图标体系的临时文件
- 后台配置所使用的 icon，应由开发从 `source/sprites` / `source/svgrs` 中挑选后复制到这里
- 后续可以直接把该目录交给后台前端开发人员使用

注意：

- `configurable-icons` 本身不是构建入口
- 如果这里只加文件，但 `source/sprites` / `source/svgrs` 中没有对应图标，前端不会展示

### `generated`

该目录用于存放 SVG 生成产物。

当前包含：

- `*.tsx`：由 `source/svgrs` 生成的 React 组件
- `svgPath_all.ts`：统一的 icon 名称类型
- `index.ts`：统一的组件映射、sprite 映射、类型导出、渲染来源登记

维护规则：

- `generated/index.ts` 和 `generated/svgPath_all.ts` 不要手动修改
- `generated/*.tsx` 当前保留“可手动接管”的能力，用于后续皮肤变量维护

## 日常维护方式

### 新增 sprite 图标

1. 将 SVG 放入 `source/sprites`
2. 执行 `pnpm gen-svg`
3. 通过 `@/components/ui/Icon` 使用

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

- 从 `source/sprites` 或 `source/svgrs` 删除源文件
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

## 注意事项

- `source/sprites` 和 `source/svgrs` 之间不允许同名图标，否则生成会直接报错
- `generated/index.ts` 中已经统一声明了每个图标是走 `sprite` 还是 `svgr`
- `public/sprite-preview.html` 可用于查看当前 sprite 图标集合
- `source` 目录下不要放无关文件，尤其不要提交临时资源
