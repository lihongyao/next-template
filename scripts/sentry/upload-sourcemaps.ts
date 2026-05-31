import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { getAppVersion } from '../shared/app-version.js';

const ROOT_DIR = process.cwd();
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const STATIC_DIR = path.join(NEXT_DIR, 'static');
const BUILD_ID_FILE = path.join(NEXT_DIR, 'BUILD_ID');

const DEFAULT_ORG = '8u8';
const DEFAULT_PROJECT = 'javascript-nextjs';
const DEFAULT_APP = 'afun';
const DEFAULT_URL_PREFIX = '~/_next/static';

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}

async function readBuildId(): Promise<string | null> {
  try {
    const buildId = await fs.readFile(BUILD_ID_FILE, 'utf8');
    return buildId.trim() || null;
  } catch {
    return null;
  }
}

async function resolveRelease(): Promise<string> {
  if (process.env.SENTRY_RELEASE) return process.env.SENTRY_RELEASE;

  const buildId = await readBuildId();
  if (buildId) return buildId;

  if (process.env.NEXT_PUBLIC_APP_VERSION) return process.env.NEXT_PUBLIC_APP_VERSION;

  const app = process.env.app || process.env.NEXT_PUBLIC_BRAND || DEFAULT_APP;
  return getAppVersion(app);
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(
  dir: string,
  predicate: (filePath: string) => boolean,
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(fullPath, predicate);
      return predicate(fullPath) ? [fullPath] : [];
    }),
  );
  return files.flat();
}

function getCliArgs(args: string[]): string[] {
  const org = process.env.SENTRY_ORG || DEFAULT_ORG;
  const project = process.env.SENTRY_PROJECT || DEFAULT_PROJECT;
  const logLevel = process.env.SENTRY_LOG_LEVEL;

  const cliArgs = [...args, '--org', org, '--project', project];
  if (logLevel) cliArgs.push('--log-level', logLevel);
  return cliArgs;
}

function runSentryCli(args: string[], options: { optional?: boolean } = {}) {
  const cli = process.platform === 'win32' ? 'sentry-cli.cmd' : 'sentry-cli';
  const cliArgs = getCliArgs(args);

  if (readBooleanEnv('SENTRY_UPLOAD_DRY_RUN', false)) {
    console.log(`[dry-run] ${cli} ${cliArgs.join(' ')}`);
    return;
  }

  try {
    execFileSync(cli, cliArgs, {
      cwd: ROOT_DIR,
      env: process.env,
      stdio: 'inherit',
    });
  } catch (error) {
    if (options.optional) {
      console.warn(`⚠️  sentry-cli ${args.join(' ')} 执行失败，继续后续步骤。`);
      return;
    }
    throw error;
  }
}

async function stripSourceMapReferences(files: string[]) {
  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, 'utf8');
      const nextContent = content
        .replace(/\n?\/\/# sourceMappingURL=.*?\.map\s*$/gm, '')
        .replace(/\n?\/\*# sourceMappingURL=.*?\.map\s*\*\/\s*$/gm, '');

      if (nextContent !== content) {
        await fs.writeFile(file, nextContent, 'utf8');
      }
    }),
  );
}

async function deleteSourceMaps(files: string[]) {
  await Promise.all(files.map((file) => fs.rm(file, { force: true })));
}

async function main() {
  const isDryRun = readBooleanEnv('SENTRY_UPLOAD_DRY_RUN', false);

  if (!(await pathExists(STATIC_DIR))) {
    throw new Error('未找到 .next/static，请先执行 next build。');
  }

  const sourceMapFiles = await collectFiles(NEXT_DIR, (file) => file.endsWith('.map'));
  if (sourceMapFiles.length === 0) {
    console.log('ℹ️  未找到 sourcemap 文件，跳过上传。');
    return;
  }

  if (!process.env.SENTRY_AUTH_TOKEN && !isDryRun) {
    throw new Error('缺少 SENTRY_AUTH_TOKEN。请在 CI 环境变量或 .env.sentry-build-plugin 中配置。');
  }

  const release = await resolveRelease();
  const urlPrefix = process.env.SENTRY_URL_PREFIX || DEFAULT_URL_PREFIX;
  const shouldDeleteSourceMaps = readBooleanEnv('SENTRY_DELETE_SOURCEMAPS', true);
  const shouldStripSourceMapReferences = readBooleanEnv('SENTRY_STRIP_SOURCEMAP_REFERENCES', true);
  const shouldFinalizeRelease = readBooleanEnv('SENTRY_FINALIZE_RELEASE', true);
  const shouldWait = readBooleanEnv('SENTRY_UPLOAD_WAIT', true);

  console.log(`⌛️ 上传 Sentry sourcemaps：release=${release}`);

  runSentryCli(['releases', 'new', release], { optional: true });

  const uploadArgs = [
    'sourcemaps',
    'upload',
    path.relative(ROOT_DIR, STATIC_DIR),
    '--release',
    release,
    '--url-prefix',
    urlPrefix,
    '--validate',
    '--strip-common-prefix',
  ];
  if (shouldWait) uploadArgs.push('--wait');
  runSentryCli(uploadArgs);

  if (shouldFinalizeRelease) {
    runSentryCli(['releases', 'finalize', release], { optional: true });
  }

  if (isDryRun) {
    console.log('[dry-run] 跳过 sourceMappingURL 清理和 sourcemap 删除');
    console.log('🎉 Sentry sourcemaps dry-run 完成');
    return;
  }

  if (shouldStripSourceMapReferences) {
    const jsAndCssFiles = await collectFiles(NEXT_DIR, (file) => /\.(?:js|css)$/.test(file));
    await stripSourceMapReferences(jsAndCssFiles);
    console.log(`✅ 已移除 ${jsAndCssFiles.length} 个构建文件中的 sourceMappingURL 引用`);
  }

  if (shouldDeleteSourceMaps) {
    await deleteSourceMaps(sourceMapFiles);
    console.log(`✅ 已删除 ${sourceMapFiles.length} 个 sourcemap 文件`);
  }

  console.log('🎉 Sentry sourcemaps 上传完成');
}

main().catch((error) => {
  console.error('❌ Sentry sourcemaps 上传失败：', error);
  process.exit(1);
});
