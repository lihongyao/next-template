/**
 * 读取 public/icons/component 和 public/icons/lazy中的文件，生成SVG类型定义并写入到 ui/Icon/svgPath_all.ts 内
 *
 *
 * 自动扫描 public/icons/component 和 public/icons/lazy 下的所有 .svg 文件
 * 并生成 src/components/Icon/svgPath_all.ts
 * 支持 --watch 模式实时监听变动
 *
 * 用法：
 *   npx tsx scripts/gen-svg-types.ts          # 一次性生成
 *   npx tsx scripts/gen-svg-types.ts --watch  # 实时监听模式
 *
 *  "gen-svg": "npx tsx scripts/gen-svg-types.ts",
 *  "gen-svg-watch": "npx tsx scripts/gen-svg-types.ts --watch"
 *
 * 依赖：
 *   pnpm add chokidar chalk prettier --save-dev
 */
import chalk from 'chalk';
import chokidar, { type FSWatcher } from 'chokidar';
import fssync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

import { SVG_TYPES_PATH } from './config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== 路径配置 ====================
/** 项目根目录 */
const ROOT = path.resolve(__dirname, '../../');
/** SVG 图标目录 */
const ICONS_DIR = path.join(ROOT, '/public/icons');
// 源文件的子目录1
const COMPONENT_ICONS_DIR = path.join(ICONS_DIR, 'component');
// 源文件的子目录2
const LAZY_ICONS_DIR = path.join(ICONS_DIR, 'lazy');

// ==================== 工具函数 ====================
/**
 * 递归扫描指定目录下的所有 SVG 文件
 * @param dir 要扫描的目录路径
 * @returns 返回包含所有 SVG 文件完整路径的数组
 */
async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)));
    } else if (entry.isFile() && fullPath.endsWith('.svg')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 生成 svgPath_all.ts 文件
 * - 扫描 ICONS_DIR 下所有 SVG 文件
 * - 输出为 TypeScript const 数组及类型
 * - 使用 prettier 格式化
 * @param showLog 是否打印生成日志，默认为 true
 */
async function generate(showLog = true): Promise<void> {
  // 扫描两个目录
  const [componentSvgFiles, lazySvgFiles] = await Promise.all([
    walkDir(COMPONENT_ICONS_DIR),
    walkDir(LAZY_ICONS_DIR),
  ]);
  const svgFiles = [...componentSvgFiles, ...lazySvgFiles].sort();

  const svgNames = svgFiles.map((fullPath) => {
    const relative = path.relative(ICONS_DIR, fullPath);
    const noExt = relative.replace(/\.svg$/i, '');
    let rez = noExt.split(path.sep).join(path.posix.sep);
    rez = rez.split('/')[1];
    return rez;
  });

  const timestamp = new Date().toISOString();
  const output = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${timestamp}

export const SVG_PATH_NAMES = [
  ${svgNames.map((n) => `"${n}"`).join(',\n  ')}
] as const;

export type SvgPathName = typeof SVG_PATH_NAMES[number];
`;

  const prettierConfig = (await prettier.resolveConfig(ROOT)) ?? {};
  const formatted = await prettier.format(output, {
    ...prettierConfig,
    parser: 'typescript',
  });

  await fs.mkdir(path.dirname(SVG_TYPES_PATH), { recursive: true });
  await fs.writeFile(SVG_TYPES_PATH, formatted, 'utf8');

  if (showLog) {
    console.log(
      chalk.green(`✔️ 已生成 ${chalk.yellow(SVG_TYPES_PATH)}，共 ${svgNames.length} 个图标`),
    );
  }
}

// ==================== 防抖函数 ====================
/**
 * 防抖函数
 * @template F 原始函数类型
 * @param fn 要防抖的函数
 * @param delay 防抖延迟（毫秒）
 * @returns 返回防抖后的函数
 */
function debounce<F extends (...args: unknown[]) => void>(fn: F, delay: number): F {
  let timer: NodeJS.Timeout | null = null;
  return ((...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as F;
}

// ==================== 监听逻辑 ====================
/**
 * 主函数
 * - 首次生成 svgPath_all.ts
 * - 可选择开启监听模式 (--watch) 实时生成
 */
export async function genSvgTypes(): Promise<void> {
  await generate(true);

  if (process.argv.includes('--watch')) {
    console.log(chalk.cyan('👀 正在监听 SVG 目录变动...'));

    if (!fssync.existsSync(ICONS_DIR)) {
      console.log(chalk.red(`❌ 图标目录不存在: ${ICONS_DIR}`));
      process.exit(1);
    }

    // 监听两个子目录
    const watchPaths = [COMPONENT_ICONS_DIR, LAZY_ICONS_DIR];
    const watcher: FSWatcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      depth: 10,
    });

    // 防抖生成函数，延迟 300ms
    const debouncedGenerate = debounce(() => generate(false), 300);

    /**
     * 文件变动事件处理
     * @param event 事件类型，例如 'add', 'unlink', 'change'
     * @param file 触发事件的文件完整路径
     */
    const onChange = (event: string, file: string) => {
      const fileName = path.relative(ICONS_DIR, file);
      console.log(chalk.gray(`[${event}]`), chalk.yellow(fileName));
      debouncedGenerate();
    };

    watcher
      .on('add', (file) => onChange('➕ 新增', file))
      .on('unlink', (file) => onChange('➖ 删除', file))
      .on('change', (file) => onChange('✏️ 修改', file))
      .on('error', (err) => console.error(chalk.red('监听错误:'), err));
  }
}

// ==================== 执行入口 ====================
// genSvgTypes().catch((err) => {
//   console.error(chalk.red("❌ 生成 svgPath_all.ts 失败:"), err);
//   process.exit(1);
// });
