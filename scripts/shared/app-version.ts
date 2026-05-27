import { execSync } from 'node:child_process';

export function getAppVersion(app = process.env.app) {
  if (!app) {
    throw new Error('app is not set');
  }
  try {
    // 获取当前 commit 上的 tags
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    // 获取当前应用的版本号，格式为：release/${app}_${timestamp}，如 release/afun_20260405_1500
    const match = tags.find((tag) => tag.startsWith(`release/${app}_`));
    if (!match) {
      throw new Error(`No tag found for ${app}`);
    }
    // 获取当前 commit 的 hash
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    // 返回版本号，格式为：release/${app}_${timestamp}_${hash}，如 release/afun_20260405_1500_12345678
    return `${match}_${hash}`;
  } catch {
    // 无 git 时 fallback，格式为：v_${app}_${timestamp}，如 v_afun_20260405_1500
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}${minutes}`;
    return `v_${app}_${timestamp}`;
  }
}
