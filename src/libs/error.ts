import { API_ERROR_EVENT, type ApiError } from '@/api';
import { NotificationApi } from '@/components/ui/Notification';
import { TFunction } from '@/i18n/types';

export { API_ERROR_EVENT };

// 只有这些错误码需要从后端 data 里取变量做文案插值。
const ERROR_CODES_WITH_PARAMS = [10001, 20001] as const;

function hasParams(code: number): boolean {
  return (ERROR_CODES_WITH_PARAMS as readonly number[]).includes(code);
}

function getErrorData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as Record<string, unknown>;
}

function toParam(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getErrorParams(error: ApiError): Record<string, string | number> | undefined {
  if (!hasParams(error.code)) return undefined;

  const data = getErrorData(error.data);
  if (!data) return undefined;

  switch (error.code) {
    case 10001: {
      // 示例：后端返回 { amount: 100 }，文案里使用 {amount}。
      const amount = toParam(data.amount);
      return amount === undefined ? undefined : { amount };
    }
    case 20001: {
      // 示例：字段名按接口实际返回调整，可能是 point、name 或 value。
      const point = toParam(data.point);
      return point === undefined ? undefined : { point };
    }
    default:
      return undefined;
  }
}

export function handleApiError(error: ApiError, notification: NotificationApi, t: TFunction) {
  const key = `message.error_${error.code}`;
  const params = getErrorParams(error);
  const description = t.has(key) ? t(key, params) : error.message;

  notification.error({ description });
}
