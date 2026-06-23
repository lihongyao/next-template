'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
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

type NotificationType = 'success' | 'info' | 'warning' | 'error';
type NotificationDuration = number | null;
type NotificationPlacement = 'topRight' | 'topCenter';

// 调用侧只需要关心这份配置。
interface NotificationConfig {
  /** 传 key 时会更新同一条通知 */
  key?: string;
  title?: ReactNode;
  description?: ReactNode;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  type?: NotificationType;
  /** 秒；0 或 null 表示不自动关闭 */
  duration?: NotificationDuration;
  maxCount?: number;
}

interface NotificationItem {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  showProgress: boolean;
  pauseOnHover: boolean;
  type: NotificationType;
  duration: NotificationDuration;
  leaving: boolean;
}

interface NotificationApi {
  open: (config: NotificationConfig) => string;
  success: (config: Omit<NotificationConfig, 'type'>) => string;
  info: (config: Omit<NotificationConfig, 'type'>) => string;
  warning: (config: Omit<NotificationConfig, 'type'>) => string;
  error: (config: Omit<NotificationConfig, 'type'>) => string;
  close: (key: string) => void;
  destroy: (key?: string) => void;
}

type UseNotificationResult = [NotificationApi];

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
  }
> = {
  success: {
    icon: 'tips_correct',
    accent: '#31ED87',
  },
  info: {
    icon: 'tips_system',
    accent: '#31ED87',
  },
  warning: {
    icon: 'tips_warning',
    accent: '#FFB24B',
  },
  error: {
    icon: 'tips_error',
    accent: '#FC0048',
  },
};

const NotificationApiContext = createContext<UseNotificationResult | null>(null);

function NotificationProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const close = useCallback((key: string) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key && !item.leaving ? { ...item, leaving: true } : item,
      ),
    );
  }, []);

  const closeAll = useCallback(() => {
    setItems((current) =>
      current.map((item) => (item.leaving ? item : { ...item, leaving: true })),
    );
  }, []);

  const open = useCallback((config: NotificationConfig) => {
    const nextItem: NotificationItem = {
      key: config.key ?? `notification_${Math.random().toString(36).slice(2, 10)}`,
      title: config.title,
      description: config.description,
      showProgress: config.showProgress ?? true,
      pauseOnHover: config.pauseOnHover ?? true,
      type: config.type ?? 'info',
      duration: config.duration === undefined ? DEFAULT_DURATION : config.duration,
      leaving: false,
    };

    setItems((current) => {
      const withoutSameKey = current.filter((item) => item.key !== nextItem.key);
      const nextQueue = [nextItem, ...withoutSameKey];
      return nextQueue.slice(0, config.maxCount ?? DEFAULT_MAX_COUNT);
    });

    return nextItem.key;
  }, []);

  const api = useMemo<NotificationApi>(
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
        closeAll();
      },
    }),
    [close, closeAll, open],
  );

  const apiValue = useMemo<UseNotificationResult>(() => [api], [api]);

  return (
    <NotificationApiContext.Provider value={apiValue}>
      {children}
      <NotificationViewport items={items} close={close} remove={remove} />
    </NotificationApiContext.Provider>
  );
}

function NotificationCard({ item, placement, onClose, onExited }: NotificationCardProps) {
  const t = useTranslations('notification');
  const { icon, accent } = TYPE_META[item.type];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMsRef = useRef<number | null>(
    typeof item.duration === 'number' && item.duration > 0 ? item.duration * 1000 : null,
  );
  const startedAtRef = useRef(Date.now());
  const [isPaused, setIsPaused] = useState(false);

  const title = item.title ?? t(item.type);
  const description = item.description;

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
    if (item.leaving) {
      clearTimer();
      return;
    }

    scheduleClose(remainingMsRef.current);
    return clearTimer;
  }, [item.key, item.leaving]);

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
        item.leaving ? 'animate-notification-leave' : 'animate-notification-enter',
      )}
      onMouseEnter={() => item.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => item.pauseOnHover && setIsPaused(false)}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (item.leaving) onExited(item.key);
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
          <div
            className="animate-notification-progress h-full origin-left"
            style={{
              animationDuration: `${item.duration}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
              background: accent,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

// 通知整体挂在根部，这里只处理位置和队列位移动画。
function NotificationViewport({
  items,
  close,
  remove,
}: {
  items: NotificationItem[];
  close: (key: string) => void;
  remove: (key: string) => void;
}) {
  const { isMobile } = useDevice();
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
            className="animate-notification-stack pointer-events-auto w-full"
          >
            <NotificationCard item={item} placement={placement} onClose={close} onExited={remove} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Provider 已经在根布局里，业务里直接拿 api 用。
function useNotification(): UseNotificationResult {
  const context = useContext(NotificationApiContext);
  if (!context) {
    throw new Error('notification.useNotification 必须在 <NotificationProvider /> 内使用');
  }
  return context;
}

const notification = {
  useNotification,
};

export { NotificationProvider, notification };
export type { NotificationApi, NotificationConfig, NotificationDuration, NotificationType };
