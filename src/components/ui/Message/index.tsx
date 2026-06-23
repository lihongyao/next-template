'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';

import Icon from '../Icon';

type MessageType = 'success' | 'info' | 'warning' | 'error';
type MessageDuration = number | null;

interface MessageConfig {
  content: ReactNode;
  type?: MessageType;
  duration?: MessageDuration;
}

interface MessageItem {
  id: number;
  content: ReactNode;
  type: MessageType;
  duration: MessageDuration;
  leaving: boolean;
}

interface MessageApi {
  open: (config: MessageConfig) => void;
  success: (content: ReactNode, duration?: MessageDuration) => void;
  info: (content: ReactNode, duration?: MessageDuration) => void;
  warning: (content: ReactNode, duration?: MessageDuration) => void;
  error: (content: ReactNode, duration?: MessageDuration) => void;
  destroy: () => void;
}

type UseMessageResult = [MessageApi];

const DEFAULT_DURATION = 2.5;

const TYPE_META: Record<
  MessageType,
  {
    icon: 'tips_correct' | 'tips_system' | 'tips_warning' | 'tips_error';
    color: string;
  }
> = {
  success: {
    icon: 'tips_correct',
    color: '#31ED87',
  },
  info: {
    icon: 'tips_system',
    color: '#31ED87',
  },
  warning: {
    icon: 'tips_warning',
    color: '#FFB24B',
  },
  error: {
    icon: 'tips_error',
    color: '#FC0048',
  },
};

const MessageApiContext = createContext<UseMessageResult | null>(null);

function MessageProvider({ children }: PropsWithChildren) {
  const nextIdRef = useRef(0);
  const [item, setItem] = useState<MessageItem | null>(null);

  const remove = useCallback((id: number) => {
    setItem((current) => (current?.id === id ? null : current));
  }, []);

  const close = useCallback(() => {
    setItem((current) => (current && !current.leaving ? { ...current, leaving: true } : current));
  }, []);

  const open = useCallback((config: MessageConfig) => {
    nextIdRef.current += 1;
    setItem({
      id: nextIdRef.current,
      content: config.content,
      type: config.type ?? 'info',
      duration: config.duration === undefined ? DEFAULT_DURATION : config.duration,
      leaving: false,
    });
  }, []);

  const api = useMemo<MessageApi>(
    () => ({
      open,
      success: (content, duration) => open({ content, duration, type: 'success' }),
      info: (content, duration) => open({ content, duration, type: 'info' }),
      warning: (content, duration) => open({ content, duration, type: 'warning' }),
      error: (content, duration) => open({ content, duration, type: 'error' }),
      destroy: close,
    }),
    [close, open],
  );

  const apiValue = useMemo<UseMessageResult>(() => [api], [api]);

  return (
    <MessageApiContext.Provider value={apiValue}>
      {children}
      <MessageViewport item={item} close={close} remove={remove} />
    </MessageApiContext.Provider>
  );
}

function MessageToast({
  item,
  onClose,
  onExited,
}: {
  item: MessageItem;
  onClose: () => void;
  onExited: (id: number) => void;
}) {
  const { icon, color } = TYPE_META[item.type];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => {
    clearTimer();

    if (item.leaving || item.duration === null || item.duration <= 0) return;

    timeoutRef.current = setTimeout(() => {
      onClose();
    }, item.duration * 1000);

    return clearTimer;
  }, [item.id, item.duration, item.leaving, onClose]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [],
  );

  return (
    <div
      data-name="MessageToast"
      className={cn(
        'pointer-events-auto flex max-w-[calc(100vw-32px)] items-center gap-2 rounded-lg bg-[#2D2D2D]/96 px-4 py-3 text-sm leading-[20px] font-semibold text-white shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-[10px]',
        item.leaving ? 'animate-message-leave' : 'animate-message-enter',
      )}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (item.leaving) onExited(item.id);
      }}
      role="status"
      aria-live="polite"
    >
      <Icon name={icon} className="size-[20px] shrink-0" color={color} />
      <span className="min-w-0 break-words">{item.content}</span>
    </div>
  );
}

function MessageViewport({
  item,
  close,
  remove,
}: {
  item: MessageItem | null;
  close: () => void;
  remove: (id: number) => void;
}) {
  if (!item) return null;

  return (
    <div
      data-name="Message"
      className="pointer-events-none fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: ZIndex.Message }}
    >
      <MessageToast key={item.id} item={item} onClose={close} onExited={remove} />
    </div>
  );
}

function useMessage(): UseMessageResult {
  const context = useContext(MessageApiContext);
  if (!context) {
    throw new Error('message.useMessage 必须在 <MessageProvider /> 内使用');
  }
  return context;
}

const message = {
  useMessage,
};

export { MessageProvider, message };
export type { MessageApi, MessageConfig, MessageDuration, MessageType };
