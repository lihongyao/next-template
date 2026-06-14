# Router README

这份文档说明当前项目的路由架构，以及后续新增路由时需要改哪些地方。

## 总览

项目使用 Next.js App Router 做文件路由，用 `next-intl` 处理 locale，用 `src/router` 作为业务导航入口。

推荐业务代码统一从 `@/router` 导入导航能力：

```ts
import { Link, usePathname, useRouter } from '@/router';
import { Routes } from '@/router/routes';
```

不要在普通业务跳转里直接使用 `next/link`、`next/navigation` 或 `@/i18n/navigation`，除非你明确想绕过项目封装。`@/router` 会额外处理：

- locale 路径规范化。
- route modal 的地址栏和底页保持。
- PC/H5 展示策略差异。
- 移动端二级页切换时的滚动和方向记录。

## 文件职责

| 文件                                  | 职责                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/router/routes.ts`                | 业务路由常量、modal 路由常量、PC/H5 自适应 modal 配置。                             |
| `src/router/useAppRouter.ts`          | 包装 `next-intl` router，处理 canonical 路径、route modal、导航方向和 scroll 选项。 |
| `src/router/AppLink.tsx`              | 包装 `next-intl` Link，点击时走 `useAppRouter()`。                                  |
| `src/router/routeRules.ts`            | 路由元信息。当前主要给移动端一级/二级页面和页面动画使用。                           |
| `src/router/matchRoute.ts`            | 根据 pathname 匹配 `routeRules`，modal 路径会先归一到底页再匹配。                   |
| `src/router/compilePath.ts`           | 把 `/path/:id` 编译成正则。                                                         |
| `src/router/index.ts`                 | 对业务侧暴露统一出口。                                                              |
| `src/libs/modal-page-routes-utils.ts` | route modal 的 canonical、渲染路径、关闭路径、重写路径等算法。                      |
| `src/proxy.ts`                        | `next-intl` middleware 和 route modal 直达请求重写。                                |

## App Router 目录结构

主要路由都在 `src/app/[locale]` 下。`[locale]` 由 `next-intl` 管理，业务路由常量里不要写 locale 前缀。

Route group 目录不会出现在 URL 里：

| 目录                                     | URL 形态               | 说明                                                       |
| ---------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| `src/app/[locale]/(responsive)`          | 普通业务路径           | 使用 `ResponsiveShell`，按设备切 Desktop/Mobile shell。    |
| `src/app/[locale]/(responsive)/(level1)` | `/`、`/cart` 等        | 移动端一级页面；其中一部分会出现在底部 TabBar。            |
| `src/app/[locale]/(responsive)/(level2)` | `/details`、`/news` 等 | 移动端二级页面，PC 仍在桌面 shell 内展示。                 |
| `src/app/[locale]/(fullscreen)`          | `/dashboard`           | 不经过 `ResponsiveShell` 的独立全屏页面。                  |
| `src/app/[locale]/(modals)`              | 无直接 page 文件       | route modal 的组件仓库，由 `RouteModalRenderer` 动态渲染。 |
| `src/app/[locale]/[...rest]/page.tsx`    | 任意未匹配 locale 路径 | 返回 404。                                                 |

根路径行为：

- `src/app/page.tsx` 会重定向到默认 locale。
- `src/i18n/routing.ts` 使用 `localePrefix: 'as-needed'`，默认语言路径通常不需要显式 locale 前缀。
- `src/app/[locale]/layout.tsx` 提供全局 provider、`ClientInitializer`、`RouteModalRenderer` 和全局样式。

## 当前已落地的页面路由

下面列的是当前有页面文件的业务 URL。实际 URL 可能带 locale 前缀，例如 `/en/news`，但 `Routes` 常量统一写不带 locale 的路径。

### 一级页面

| URL          | 文件                                                        | 路由常量           | 说明                                     |
| ------------ | ----------------------------------------------------------- | ------------------ | ---------------------------------------- |
| `/`          | `src/app/[locale]/(responsive)/(level1)/page.tsx`           | `Routes.Home`      | 首页，移动端一级页，也是 tab 页。        |
| `/cart`      | `src/app/[locale]/(responsive)/(level1)/cart/page.tsx`      | `Routes.Cart`      | 购物车，移动端一级页，也是 tab 页。      |
| `/order`     | `src/app/[locale]/(responsive)/(level1)/order/page.tsx`     | `Routes.Order`     | 订单，移动端一级页，也是 tab 页。        |
| `/promotion` | `src/app/[locale]/(responsive)/(level1)/promotion/page.tsx` | `Routes.Promotion` | 活动，移动端一级页，也是 tab 页。        |
| `/truco`     | `src/app/[locale]/(responsive)/(level1)/truco/page.tsx`     | `Routes.Truco`     | Truco 一级页，当前不在底部 TabBar 中。   |
| `/vip`       | `src/app/[locale]/(responsive)/(level1)/vip/page.tsx`       | 当前未进 `Routes`  | 文件路由已存在，如需业务跳转建议补常量。 |

### 二级页面

| URL                  | 文件                                                                | 路由常量                 | 说明                                |
| -------------------- | ------------------------------------------------------------------- | ------------------------ | ----------------------------------- |
| `/details`           | `src/app/[locale]/(responsive)/(level2)/details/page.tsx`           | `Routes.Details`         | 详情示例页。                        |
| `/dialog`            | `src/app/[locale]/(responsive)/(level2)/dialog/page.tsx`            | `Routes.Dialog`          | 普通弹窗示例页。                    |
| `/dynamic-comps`     | `src/app/[locale]/(responsive)/(level2)/dynamic-comps/page.tsx`     | `Routes.DynamicComps`    | 动态组件示例页。                    |
| `/data-pass-through` | `src/app/[locale]/(responsive)/(level2)/data-pass-through/page.tsx` | `Routes.DataPathThrough` | 数据透传示例页。                    |
| `/i18n`              | `src/app/[locale]/(responsive)/(level2)/i18n/page.tsx`              | `Routes.I18n`            | 国际化示例页。                      |
| `/theme-and-skin`    | `src/app/[locale]/(responsive)/(level2)/theme-and-skin/page.tsx`    | `Routes.ThemeAndSkin`    | 主题和皮肤示例页。                  |
| `/demo`              | `src/app/[locale]/(responsive)/(level2)/demo/page.tsx`              | 当前未进 `Routes`        | Demo 页面，如需业务跳转建议补常量。 |

### 列表 / 详情路由

| URL              | 文件                                                             | 路由常量                          | 说明                                                |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------- |
| `/game-list`     | `src/app/[locale]/(responsive)/(level2)/game-list/page.tsx`      | `Routes.GameList`                 | 游戏列表。PC 是普通页，H5 可作为 route modal 展示。 |
| `/game-list/:id` | `src/app/[locale]/(responsive)/(level2)/game-list/[id]/page.tsx` | 手动拼 `${Routes.GameList}/${id}` | 游戏详情。H5 下会嵌套在游戏列表 modal 中。          |
| `/news`          | `src/app/[locale]/(responsive)/(level2)/news/page.tsx`           | `Routes.News`                     | 新闻列表。                                          |
| `/news/:id`      | `src/app/[locale]/(responsive)/(level2)/news/[id]/page.tsx`      | 手动拼 `${Routes.News}/${id}`     | 新闻详情。PC 是 route modal，H5 是独立页。          |

### Fullscreen 页面

| URL          | 文件                                               | 路由常量           | 说明                                 |
| ------------ | -------------------------------------------------- | ------------------ | ------------------------------------ |
| `/dashboard` | `src/app/[locale]/(fullscreen)/dashboard/page.tsx` | `Routes.Dashboard` | 全屏页面，不经过 `ResponsiveShell`。 |

### Route modal 路由

这些路径没有 `page.tsx`，对应组件在 `src/app/[locale]/(modals)`，由 `RouteModalRenderer` 根据地址栏渲染。

| URL                 | 组件                                             | 路由常量                     | 说明                                                |
| ------------------- | ------------------------------------------------ | ---------------------------- | --------------------------------------------------- |
| `/login`            | `src/app/[locale]/(modals)/login.tsx`            | `Routes.ModalLogin`          | 登录 route modal。                                  |
| `/register`         | `src/app/[locale]/(modals)/register.tsx`         | `Routes.ModalRegister`       | 注册 route modal。                                  |
| `/profile`          | `src/app/[locale]/(modals)/profile.tsx`          | `Routes.ModalProfile`        | 个人中心 route modal，当前在 `ProtectedRoutes` 中。 |
| `/game-list-swiper` | `src/app/[locale]/(modals)/game-list-swiper.tsx` | `Routes.ModalGameListSwiper` | H5 游戏列表 modal。                                 |
| `/game-details`     | `src/app/[locale]/(modals)/game-details.tsx`     | `Routes.ModalGameDetails`    | H5 游戏详情 modal。                                 |
| `/news-details`     | `src/app/[locale]/(modals)/news-details.tsx`     | `Routes.ModalNewsDetails`    | PC 新闻详情 modal。                                 |

## 路由常量

`src/router/routes.ts` 将路由拆为三类：

- `TabRoutes`：底部 tab / 一级入口。
- `PageRoutes`：普通页面和业务 canonical 路径。
- `ModalRoutes`：route modal 的内部渲染路径。

`Routes` 是三者的合并，业务代码优先使用它。

注意事项：

- 常量不自动从 `src/app` 生成，需要手动维护。
- 常量路径不包含 locale。
- 动态详情页通常使用列表常量拼接，例如 `${Routes.News}/${id}`。
- `Routes.GameDetails` 当前和 `Routes.GameList` 都是 `/game-list`，详情通过 path tail 表达。
- 已存在页面 `/vip`、`/demo` 当前没有进 `Routes`，如果要正式业务跳转，建议先补常量和 `routeRules`。

## 路由元信息

`src/router/routeRules.ts` 定义 `RouteMeta`：

```ts
type RouteMeta = {
  mobileLevel: 1 | 2;
  desktopLevel: 1 | 2;
};
```

当前主要由移动端 shell 使用：

- `mobileLevel: 1`：移动端一级页，通常显示 Header、TabBar。
- `mobileLevel: 2`：移动端二级页，显示在 `MobilePageTransition` / `MobileLevel2` 中。
- 未命中的路由默认 `{ mobileLevel: 1, desktopLevel: 1 }`。

移动端一级页的缓存不由 `routeRules` 配置控制。当前 `MobileShell` 会对一级页底页使用 `KeepAlive`，缓存 key 是页面 pathname。

新增动态路由时要同时加动态规则：

```ts
{ path: Routes.News, meta: { mobileLevel: 2, desktopLevel: 1 } },
{ path: Routes.News + '/:id', meta: { mobileLevel: 2, desktopLevel: 1 } },
```

## Route modal 机制

项目里有两类 route modal。

### 显式 modal

例如 `/login`、`/profile`。业务代码直接跳转到 `Routes.ModalLogin`。`useAppRouter()` 会发现目标是 route modal，只更新浏览器地址和 history state，不切换 Next 页面树，底页保持当前页面。

直达 `/login` 时，`src/proxy.ts` 会把请求重写到底页 `/`，浏览器地址仍保持 `/login`，再由 `RouteModalRenderer` 渲染 modal。

### PC/H5 自适应 modal

配置在 `ModalPageRoutes` 中，用 canonical URL 表示业务地址，按设备决定展示为页面还是 modal。

当前配置：

| key            | canonical    | PC                    | H5                        | 效果                                                             |
| -------------- | ------------ | --------------------- | ------------------------- | ---------------------------------------------------------------- |
| `news-details` | `/news`      | `/news-details` modal | `/news` page              | `/news/:id` 在 PC 上显示新闻详情 modal，在 H5 上显示独立详情页。 |
| `game-list`    | `/game-list` | `/game-list` page     | `/game-list-swiper` modal | `/game-list` 在 PC 上是页面，在 H5 上是游戏列表 modal。          |
| `gameDetails`  | `/game-list` | `/game-list` page     | `/game-details` modal     | `/game-list/:id` 在 H5 上嵌套在游戏列表 modal 内。               |

字段含义：

- `canonical`：地址栏和后台配置使用的标准业务路径。
- `pc` / `h5`：当前设备实际用来渲染的页面或 modal 路径。
- `onlySwitchWhenParamPresent`：只有存在 path tail 时才命中，例如 `/news/1`。
- `parentKey`：嵌套 modal 使用，例如 H5 游戏详情嵌套在游戏列表 modal 内。

相关运行时：

- `RouteModalRenderer` 根据当前地址计算 modal 渲染路径，并从 `ModalComponents` 加载组件。
- `useModalPageAutoCollapse` 处理视口切换时页面和 modal 的自动切换。
- `proxy.ts` 处理服务端直达 modal URL 时的底页 rewrite。
- `useModalRoutes().getModalParams(target)` 可在 modal 组件中读取动态参数。

## 新增普通页面

1. 在合适的 App Router 目录下新增页面文件。

   ```txt
   src/app/[locale]/(responsive)/(level2)/foo/page.tsx
   ```

2. 在 `src/router/routes.ts` 增加常量。

   ```ts
   export const PageRoutes = {
     // ...
     Foo: '/foo',
   } as const;
   ```

3. 在 `src/router/routeRules.ts` 增加元信息。

   ```ts
   { path: Routes.Foo, meta: { mobileLevel: 2, desktopLevel: 1 } },
   ```

4. 业务跳转使用 `@/router`。

   ```tsx
   const router = useRouter();
   router.push(Routes.Foo);

   <Link href={Routes.Foo}>Foo</Link>;
   ```

5. 如果是 tab 页，还要更新 `src/components/features/AppTabBar.tsx` 的 `tabBarConfig`。

## 新增动态详情页

1. 新增文件路由。

   ```txt
   src/app/[locale]/(responsive)/(level2)/foo/[id]/page.tsx
   ```

2. 常量通常只加列表 canonical 路径。

   ```ts
   Foo: '/foo',
   ```

3. `routeRules.ts` 同时加列表和详情规则。

   ```ts
   { path: Routes.Foo, meta: { mobileLevel: 2, desktopLevel: 1 } },
   { path: Routes.Foo + '/:id', meta: { mobileLevel: 2, desktopLevel: 1 } },
   ```

4. 跳转时手动拼 path tail。

   ```ts
   router.push(`${Routes.Foo}/${id}`);
   ```

## 新增显式 route modal

1. 在 `ModalRoutes` 中增加路径。

   ```ts
   ModalFoo: '/foo-modal',
   ```

2. 新增 modal 组件。

   ```txt
   src/app/[locale]/(modals)/foo-modal.tsx
   ```

3. 在 `src/app/[locale]/(modals)/index.ts` 注册组件。key 必须和路径 segment 对上。

   ```ts
   export const ModalComponents = {
     // ...
     'foo-modal': loadModal('foo-modal'),
   };
   ```

4. 跳转使用封装 router。

   ```ts
   router.push(Routes.ModalFoo, { scroll: false });
   ```

5. 如果需要关闭 modal，组件内优先使用 `useModal().closeModal`，不要手写关闭路径。

## 新增 PC/H5 自适应路由

适用于同一个业务 URL，在 PC 和 H5 展示形态不同的场景。

1. 先创建 canonical 页面文件，例如：

   ```txt
   src/app/[locale]/(responsive)/(level2)/article/page.tsx
   src/app/[locale]/(responsive)/(level2)/article/[id]/page.tsx
   ```

2. 如果某端要用 modal 展示，创建 modal 组件并注册到 `ModalComponents`。

   ```txt
   src/app/[locale]/(modals)/article-details.tsx
   ```

3. 在 `routes.ts` 中增加 canonical 和 modal 路径。

   ```ts
   Article: '/article',
   ModalArticleDetails: '/article-details',
   ```

4. 在 `ModalPageRoutes` 增加配置。

   ```ts
   articleDetails: {
     canonical: Routes.Article,
     pc: Routes.ModalArticleDetails,
     h5: Routes.Article,
     onlySwitchWhenParamPresent: true,
   },
   ```

5. 在 `routeRules.ts` 增加 canonical 和动态规则。

   ```ts
   { path: Routes.Article, meta: { mobileLevel: 2, desktopLevel: 1 } },
   { path: Routes.Article + '/:id', meta: { mobileLevel: 2, desktopLevel: 1 } },
   ```

6. 业务侧始终跳 canonical URL。

   ```ts
   router.push(`${Routes.Article}/${id}`);
   ```

不要在业务侧判断 PC/H5 后跳不同路径。设备差异由 `useAppRouter`、`RouteModalRenderer`、`useModalPageAutoCollapse` 和 `proxy.ts` 统一处理。

## 新增 fullscreen 页面

如果页面不需要 `ResponsiveShell`、底部 tab 或移动端二级页结构，放到 `(fullscreen)`：

```txt
src/app/[locale]/(fullscreen)/report/page.tsx
```

然后在 `PageRoutes` 中增加：

```ts
Report: '/report',
```

如果该页面需要参与移动端动画或路由分级，再补 `routeRules.ts`。

## 提交流程前检查

新增或修改路由后建议执行：

```bash
pnpm exec tsc --noEmit
pnpm lint
```

手动验证时至少覆盖：

- 默认 locale 和非默认 locale URL。
- `router.push` 和浏览器返回。
- 移动端一级页 / 二级页切换。
- route modal 的打开、关闭、直达刷新。
- PC/H5 自适应 route modal 的视口切换。
