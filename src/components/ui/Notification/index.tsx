'use client';

import {
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';
import { useDevice } from '@/providers/device.provider';

import Icon from '../Icon';

// === Notification 类型 ===

/** 通知类型 */
type NotificationType = 'success' | 'info' | 'warning' | 'error';
/** 自动关闭时长，单位：秒 */
type NotificationDuration = number | null;
/** 桌面 / 移动端的展示锚点 */
type NotificationPlacement = 'topRight' | 'topCenter';
/** 通知生命周期 */
type NotificationPhase = 'entering' | 'visible' | 'leaving';

/** 通知内容与展示行为的共享字段 */
interface NotificationShared {
  /** 标题 */
  title?: ReactNode;
  /** 描述 */
  description?: ReactNode;
  /** 是否展示底部进度条 */
  showProgress?: boolean;
  /** hover 时是否暂停自动关闭 */
  pauseOnHover?: boolean;
  /** 通知类型 */
  type?: NotificationType;
  /** 自动关闭时间；设为 0 或 null 则不自动关闭 */
  duration?: NotificationDuration;
}

/** notification.useNotification / api.open 接收的配置 */
interface NotificationConfig extends NotificationShared {
  /** 可选的稳定 key，用于更新或关闭同一条通知 */
  key?: string;
  /** 最大同时显示数量 */
  maxCount?: number;
}

/** 内部队列项 */
interface NotificationItem extends Omit<
  NotificationShared,
  'showProgress' | 'pauseOnHover' | 'type'
> {
  key: string;
  showProgress: boolean;
  pauseOnHover: boolean;
  type: NotificationType;
  duration: NotificationDuration;
  phase: NotificationPhase;
}

/** 对外暴露的通知 API */
interface NotificationApi {
  open: (config: NotificationConfig) => string;
  success: (config: Omit<NotificationConfig, 'type'>) => string;
  info: (config: Omit<NotificationConfig, 'type'>) => string;
  warning: (config: Omit<NotificationConfig, 'type'>) => string;
  error: (config: Omit<NotificationConfig, 'type'>) => string;
  close: (key: string) => void;
  destroy: (key?: string) => void;
  clear: () => void;
}

/** Provider 内部上下文 */
interface NotificationContextValue {
  items: NotificationItem[];
  open: (config: NotificationConfig) => string;
  close: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
}

/** Notification 卡片 props */
interface NotificationCardProps {
  item: NotificationItem;
  placement: NotificationPlacement;
  onClose: (key: string) => void;
  onExited: (key: string) => void;
}

const DEFAULT_DURATION = 4.5;
const DEFAULT_MAX_COUNT = 10;

const TYPE_META: Record<
  NotificationType,
  {
    icon: 'tips_correct' | 'tips_system' | 'tips_warning' | 'tips_error';
    accent: string;
    fallbackTitleKey: 'success' | 'info' | 'warning' | 'error';
  }
> = {
  success: {
    icon: 'tips_correct',
    accent: '#31ED87',
    fallbackTitleKey: 'success',
  },
  info: {
    icon: 'tips_system',
    accent: '#31ED87',
    fallbackTitleKey: 'info',
  },
  warning: {
    icon: 'tips_warning',
    accent: '#FFB24B',
    fallbackTitleKey: 'warning',
  },
  error: {
    icon: 'tips_error',
    accent: '#FC0048',
    fallbackTitleKey: 'error',
  },
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

/** 把调用方传进来的配置补齐为内部队列项 */
function createNotificationItem(config: NotificationConfig): NotificationItem {
  const key = config.key ?? `notification_${Math.random().toString(36).slice(2, 10)}`;

  return {
    key,
    title: config.title,
    description: config.description,
    showProgress: config.showProgress ?? true,
    pauseOnHover: config.pauseOnHover ?? true,
    type: config.type ?? 'info',
    duration: config.duration === undefined ? DEFAULT_DURATION : config.duration,
    phase: 'entering',
  };
}

/** 读取 Notification 上下文；必须在 provider 内使用 */
function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('notification.useNotification 必须在 <NotificationProvider /> 内使用');
  }
  return context;
}

function NotificationProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const close = useCallback((key: string) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key && item.phase !== 'leaving' ? { ...item, phase: 'leaving' } : item,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    setItems((current) =>
      current.map((item) => (item.phase === 'leaving' ? item : { ...item, phase: 'leaving' })),
    );
  }, []);

  const open = useCallback((config: NotificationConfig) => {
    const nextItem = createNotificationItem(config);

    setItems((current) => {
      const withoutSameKey = current.filter((item) => item.key !== nextItem.key);
      const nextQueue = [nextItem, ...withoutSameKey];
      return nextQueue.slice(0, config.maxCount ?? DEFAULT_MAX_COUNT);
    });

    return nextItem.key;
  }, []);

  const contextValue = useMemo<NotificationContextValue>(
    () => ({ items, open, close, remove, clear }),
    [items, open, close, remove, clear],
  );

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

function NotificationCard({ item, placement, onClose, onExited }: NotificationCardProps) {
  const t = useTranslations('notification');
  const { icon, accent, fallbackTitleKey } = TYPE_META[item.type];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMsRef = useRef<number | null>(
    typeof item.duration === 'number' && item.duration > 0 ? item.duration * 1000 : null,
  );
  const startedAtRef = useRef(Date.now());
  const [isPaused, setIsPaused] = useState(false);

  const title = item.title ?? t(fallbackTitleKey);
  const description = item.description;

  const progressStyle = useMemo<CSSProperties>(() => {
    if (!item.showProgress || !item.duration || item.duration <= 0) return {};
    return {
      animationDuration: `${item.duration}s`,
      animationPlayState: isPaused ? 'paused' : 'running',
      background: accent,
    };
  }, [accent, isPaused, item.duration, item.showProgress]);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleClose = (delayMs: number | null) => {
    clearTimer();
    if (delayMs === null || delayMs <= 0) return;
    startedAtRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      onClose(item.key);
    }, delayMs);
  };

  useEffect(() => {
    if (item.phase === 'leaving') {
      clearTimer();
      return;
    }

    scheduleClose(remainingMsRef.current);
    return clearTimer;
  }, [item.key, item.phase]);

  useEffect(() => {
    if (!item.pauseOnHover || remainingMsRef.current === null) return;

    if (isPaused) {
      if (timeoutRef.current) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
      }
      clearTimer();
      return;
    }

    scheduleClose(remainingMsRef.current);
  }, [isPaused, item.pauseOnHover]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [],
  );

  return (
    <div
      data-name="NotificationCard"
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-white/8 bg-[#2D2D2D]/96 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-[10px]',
        'max-w-[356px]',
        placement === 'topCenter' && 'mx-auto',
        item.phase === 'entering' &&
          (placement === 'topRight' ? 'notification-enter-right' : 'notification-enter-down'),
        item.phase === 'leaving' && 'notification-leave-fade',
      )}
      onMouseEnter={() => item.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => item.pauseOnHover && setIsPaused(false)}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (item.phase === 'leaving') onExited(item.key);
      }}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex min-h-[88px] items-start gap-3 px-4 py-4 pr-12">
        <Icon name={icon} className="mt-[2px] size-[22px] shrink-0" color={accent} />
        <div className="min-w-0 flex-1 space-y-1">
          {title ? <div className="text-sm font-semibold text-white">{title}</div> : null}
          {description ? (
            <div className="text-xs leading-[18px] font-medium break-words text-[#B3B8C1]">
              {description}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={t('close')}
          className="absolute top-4 right-4 flex size-6 cursor-pointer items-center justify-center rounded-full text-[#D9D9D9] transition-opacity hover:opacity-80"
          onClick={() => onClose(item.key)}
        >
          <Icon name="close" className="size-[18px]" color="currentColor" />
        </button>
      </div>

      {item.showProgress && item.duration && item.duration > 0 ? (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/8">
          <div className="animate-notification-progress h-full origin-left" style={progressStyle} />
        </div>
      ) : null}
    </div>
  );
}

/** 根级通知宿主，负责响应式定位与队列位移动画 */
function NotificationViewport() {
  const { isMobile } = useDevice();
  const { items, close, remove } = useNotificationContext();
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const previousTopsRef = useRef(new Map<string, number>());
  const rafRef = useRef<number | null>(null);
  const placement: NotificationPlacement = isMobile ? 'topCenter' : 'topRight';
  const topOffset = 'calc(env(safe-area-inset-top, 0px) + 60px)';

  const setItemRef = useCallback(
    (key: string) => (node: HTMLDivElement | null) => {
      if (node) {
        itemRefs.current.set(key, node);
        return;
      }

      itemRefs.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    const nextTops = new Map<string, number>();
    const movedNodes: HTMLDivElement[] = [];

    items.forEach((item) => {
      const node = itemRefs.current.get(item.key);
      if (!node) return;

      const nextTop = node.getBoundingClientRect().top;
      nextTops.set(item.key, nextTop);

      const previousTop = previousTopsRef.current.get(item.key);
      if (previousTop === undefined) return;

      const deltaY = previousTop - nextTop;
      if (Math.abs(deltaY) < 1) return;

      node.style.transition = 'none';
      node.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      movedNodes.push(node);
    });

    if (movedNodes.length) {
      movedNodes[0]?.getBoundingClientRect();
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      movedNodes.forEach((node) => {
        node.style.transition = '';
        node.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    previousTopsRef.current = nextTops;

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [items]);

  useEffect(
    () => () => {
      itemRefs.current.clear();
      previousTopsRef.current.clear();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  if (!items.length) return null;

  return (
    <div
      data-name="Notification"
      className={cn(
        'pointer-events-none fixed inset-x-0 flex px-3',
        placement === 'topRight' ? 'justify-end md:px-4' : 'justify-center',
      )}
      style={{ top: topOffset, zIndex: ZIndex.Message }}
    >
      <div
        className={cn(
          'flex w-full flex-col gap-3',
          placement === 'topRight'
            ? 'max-w-[380px] items-end'
            : 'max-w-[calc(100vw-24px)] items-center',
        )}
      >
        {items.map((item) => (
          <div
            key={item.key}
            ref={setItemRef(item.key)}
            className="notification-stack-item pointer-events-auto w-full"
          >
            <NotificationCard item={item} placement={placement} onClose={close} onExited={remove} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 根级挂载场景下，业务侧直接拿全局 notification api 即可 */
function useNotificationApi(): NotificationApi {
  const { open, close, clear } = useNotificationContext();
  return useMemo(
    () => ({
      open,
      success: (config) => open({ ...config, type: 'success' }),
      info: (config) => open({ ...config, type: 'info' }),
      warning: (config) => open({ ...config, type: 'warning' }),
      error: (config) => open({ ...config, type: 'error' }),
      close,
      destroy: (key) => {
        if (key) {
          close(key);
          return;
        }
        clear();
      },
      clear,
    }),
    [clear, close, open],
  );
}

const NotificationHost = memo(function NotificationHost() {
  return <NotificationViewport />;
});

NotificationHost.displayName = 'NotificationHost';

const notification = {
  useNotificationApi,
};

export { NotificationHost as Notification, NotificationProvider, notification };
export type { NotificationApi, NotificationConfig, NotificationDuration, NotificationType };
export default NotificationHost;
