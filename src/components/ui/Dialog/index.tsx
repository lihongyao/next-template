'use client';

import React, {
  type ReactElement,
  type ReactNode,
  Suspense,
  createContext,
  forwardRef,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';
import { type Root, createRoot } from 'react-dom/client';

import { dialogRegistry } from '@/components/features/dialogs';
import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';

import './animate.css';

/** 进入动画 */
export type DialogEnterAnimation = 'fade-in' | 'zoom-in' | 'slide-up-in' | 'slide-right-in';
/** 退出动画 */
export type DialogExitAnimation = 'fade-out' | 'zoom-out' | 'slide-up-out' | 'slide-right-out';

/** Dialog 关闭原因 */
export type DialogCloseReason = 'manual' | 'mask' | 'autoDestroy' | 'popstate';
export type DialogAfterCloseEvent = {
  reason: DialogCloseReason;
  stayDurationMs: number;
};

/** 全局可见 Dialog 集合，用于 body scroll 管理 */
const visibleDialogs = new Set<string>();

const createDialogId = () => `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;

/** 锁住 body 滚动 */
const lockBodyScroll = () => {
  document.documentElement.style.overflow = 'hidden';
};

/** 解锁 body 滚动（只有没有任何弹窗时才解锁） */
const unlockBodyScroll = () => {
  if (visibleDialogs.size === 0) document.documentElement.style.overflow = 'auto';
};

/** 对外暴露的 Ref 方法类型 */
interface DialogRef {
  setIsExiting: (reason?: DialogCloseReason) => void;
}

type StartCloseOptions = {
  viaControlledOnClose?: boolean;
};

// === 全局 Dialog 基础 ===

/** Dialog 组件 props */
interface DialogProps {
  /** 类名 - 遮罩 */
  maskClassName?: string;
  /** 类名 - 内容 */
  contentClassName?: string;
  /** 弹框是否打开（受控模式，仅作为组件调用时有效） */
  open?: boolean;
  /** 弹框层级，默认4000 */
  zIndex?: number;
  /** 弹框内容 */
  children: ReactNode;
  /** 是否允许点击遮罩关闭，默认true */
  maskClosable?: boolean;
  /** 自动销毁 */
  autoDestroy?: number;
  /** 进入动画，默认zoom-in */
  enterAnimation?: DialogEnterAnimation;
  /** 退出动画，默认zoom-out */
  exitAnimation?: DialogExitAnimation;
  /** 是否允许同一类型 Dialog 同时打开多个实例 */
  multiple?: boolean;
  /** 弹窗标识（useDialog.open 场景建议直接用 type） */
  dialogId?: string;
  /** 兼容旧参数：等价于 dialogId */
  dataName?: string;

  /** 用户意图关闭（仅受控模式触发） */
  onClose?: () => void;
  /** 弹窗完全关闭后触发（任何模式） */
  onAfterClose?: (event: DialogAfterCloseEvent) => void;

  /** 路由前进/后退时是否自动关闭，默认true */
  closeOnPopstate?: boolean;
  /** 内部使用，标记是否由 Provider 管理，避免重复监听 popstate */
  _managedByProvider?: boolean;
  /** 内部使用：实例动画结束 promise */
  _afterClosePromise?: Promise<void>;
  /** 内部使用：设置动画结束 promise */
  _setAfterClosePromise?: (p: Promise<void>) => void;
}

// === Dialog 组件 ===

/** 支持 forwardRef，以便静态方法或 Provider 控制弹窗关闭 */
const DialogComponent = forwardRef<DialogRef, DialogProps>((props, ref) => {
  const {
    open,
    children,
    zIndex = ZIndex.Dialog,
    maskClosable = true,
    autoDestroy,
    dialogId,
    dataName,
    maskClassName,
    contentClassName,
    enterAnimation = 'zoom-in',
    exitAnimation = 'zoom-out',
    onClose,
    onAfterClose,
    closeOnPopstate = true,
    _managedByProvider = false,
    _setAfterClosePromise,
  } = props;

  // 是否为受控组件（通过是否显式传入 open 判断）
  const isControlled = open !== undefined;

  // states
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open ?? true);
  const [isExiting, setIsExiting] = useState(false);

  // refs
  const instanceId = useRef(createDialogId());
  const resolvedDialogId = dialogId ?? dataName ?? instanceId.current;
  const autoDestroyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterCloseResolveRef = useRef<(() => void) | null>(null);
  const closeReasonRef = useRef<DialogCloseReason>('manual');
  const isAnimatingRef = useRef(false);
  const openStartedAtRef = useRef<number | null>(Date.now());

  const startClose = (
    reason: DialogCloseReason = 'manual',
    { viaControlledOnClose = false }: StartCloseOptions = {},
  ) => {
    if (isAnimatingRef.current) return false;
    closeReasonRef.current = reason;

    if (isControlled && viaControlledOnClose) {
      onClose?.();
      return true;
    }

    isAnimatingRef.current = true;
    setIsExiting(true);
    return true;
  };

  useImperativeHandle(ref, () => ({
    setIsExiting: (reason: DialogCloseReason = 'manual') => {
      startClose(reason);
    },
  }));

  // 初始化挂载；非受控模式下首次展示时也标记为动画中，避免在进入动画期间重复触发
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && visible && !isExiting) {
      isAnimatingRef.current = true;
      if (openStartedAtRef.current === null) {
        openStartedAtRef.current = Date.now();
      }
    }
  }, [mounted]);

  // 创建动画结束 promise
  useEffect(() => {
    const p = new Promise<void>((resolve) => {
      afterCloseResolveRef.current = resolve;
    });
    _setAfterClosePromise?.(p);
  }, [_setAfterClosePromise]);

  // 响应受控组件 open 状态变化（动画中忽略重复的 open/close 切换）
  useEffect(() => {
    if (!isControlled) return;
    if (open) {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setVisible(true);
      setIsExiting(false);
      closeReasonRef.current = 'manual'; // 重置 reason
    } else if (visible) {
      // 受控模式下，open 变为 false 时，沿用最近一次 close reason
      startClose(closeReasonRef.current);
    }
  }, [open, isControlled, visible]);

  // 自动销毁逻辑
  useEffect(() => {
    if (!autoDestroy || !visible) return;
    autoDestroyTimer.current = setTimeout(() => {
      startClose('autoDestroy');
    }, autoDestroy * 1000);
    return () => {
      if (autoDestroyTimer.current) clearTimeout(autoDestroyTimer.current);
      autoDestroyTimer.current = null;
    };
  }, [autoDestroy, visible]);

  // 用户触发关闭意图（遮罩/closeDialog）- 动画中忽略重复触发
  const requestClose = (reason: DialogCloseReason = 'manual') => {
    // 受控模式下，通知父组件改 open；非受控模式直接触发退出动画
    startClose(reason, { viaControlledOnClose: true });
  };

  // 点击遮罩关闭
  const handleMaskClick = () => {
    if (!maskClosable) return;
    requestClose('mask');
  };

  // 动画结束处理（进入/退出动画结束时解除「动画中」锁）
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isExiting) {
      // 进入动画结束，允许后续交互
      isAnimatingRef.current = false;
      return;
    }

    setVisible(false);
    setIsExiting(false);
    isAnimatingRef.current = false;

    visibleDialogs.delete(instanceId.current);
    unlockBodyScroll();

    const reason = closeReasonRef.current;
    const endAt = Date.now();
    const stayDurationMs =
      openStartedAtRef.current === null ? 0 : Math.max(0, endAt - openStartedAtRef.current);
    const eventPayload: DialogAfterCloseEvent = { reason, stayDurationMs };
    openStartedAtRef.current = null;
    onAfterClose?.(eventPayload);
    afterCloseResolveRef.current?.();
  };

  // 管理全局可见 Dialog 集合，锁滚动
  useEffect(() => {
    if (visible && !isExiting) {
      visibleDialogs.add(instanceId.current);
      lockBodyScroll();
    }
    return () => {
      visibleDialogs.delete(instanceId.current);
      unlockBodyScroll();
    };
  }, [visible, isExiting]);

  // popstate 关闭
  useEffect(() => {
    // 如果关闭功能被禁用，或者由 Provider 管理，则跳过
    if (!closeOnPopstate || _managedByProvider) return;
    const handlePopstate = () => {
      startClose('popstate');
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [closeOnPopstate, _managedByProvider]);

  if (!mounted || !visible) return null;

  const content = (
    <div data-name={resolvedDialogId} className="dialog-root fixed inset-0" style={{ zIndex }}>
      {/* 遮罩 */}
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-black/70 backdrop-blur-xs',
          isExiting ? 'fade-out' : 'fade-in',
          maskClassName,
        )}
        onClick={handleMaskClick}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* 内容 */}
        <div
          className={cn(isExiting ? exitAnimation : enterAnimation, contentClassName)}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

// === 导出 Dialog ===
export const Dialog = DialogComponent as typeof DialogComponent & {
  open: (options: DialogStaticOptions) => { key: string; close: () => Promise<void> };
  close: (key?: string) => Promise<void>;
};

// === 静态方法管理 ===

type DialogStaticOptions = Omit<DialogProps, 'open' | 'children' | 'onClose'> & {
  content: ReactNode;
};

type DialogEntry = {
  root: Root;
  container: HTMLDivElement;
  key: string;
  closeDialog: () => void;
  promise?: Promise<void>;
};

let dialogZIndex = ZIndex.Dialog;
const dialogMap = new Map<string, DialogEntry>();

Dialog.open = (options: DialogStaticOptions) => {
  const key = createDialogId();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let resolveFn: (() => void) | null = null;
  const promise = new Promise<void>((resolve) => {
    resolveFn = resolve;
  });

  const dialogRef: { current: DialogRef | null } = { current: null };

  const closeDialog = () => dialogRef.current?.setIsExiting('manual');

  root.render(
    <DialogComponent
      ref={dialogRef}
      maskClosable={options.maskClosable}
      autoDestroy={options.autoDestroy}
      contentClassName={options.contentClassName}
      maskClassName={options.maskClassName}
      zIndex={options.zIndex ?? dialogZIndex++}
      _managedByProvider
      dialogId={options.dialogId ?? options.dataName}
      _setAfterClosePromise={(p) => p.then(() => resolveFn?.())}
      onAfterClose={(event) => {
        root.unmount();
        container.remove();
        dialogMap.delete(key);
        options.onAfterClose?.(event);
      }}
    >
      {options.content}
    </DialogComponent>,
  );

  dialogMap.set(key, { root, container, key, closeDialog, promise });

  return {
    key,
    close: () => {
      const entry = dialogMap.get(key);
      if (entry) {
        entry.closeDialog();
        return entry.promise ?? Promise.resolve();
      }
      return Promise.resolve();
    },
  };
};

Dialog.close = async (key?: string) => {
  if (key) {
    const entry = dialogMap.get(key);
    if (!entry) return;
    entry.closeDialog();
    return entry.promise;
  } else {
    const promises: Promise<void>[] = [];
    dialogMap.forEach((entry) => {
      entry.closeDialog();
      if (entry.promise) promises.push(entry.promise);
    });
    return Promise.all(promises).then(() => {});
  }
};

// === Provider + useDialog ===
/** 弹框类型 */
export type DialogType = keyof typeof dialogRegistry;
type DialogRegistry = typeof dialogRegistry;
type DialogModule<K extends DialogType> = Awaited<ReturnType<DialogRegistry[K]>>;
type DialogComponent<K extends DialogType> = DialogModule<K>['default'];
/** 弹框内容组件 Props */
type PropsOf<K extends DialogType> = K extends DialogType
  ? DialogComponent<K> extends React.JSXElementConstructor<infer Props>
    ? Props extends object
      ? Props
      : object
    : object
  : never;
type DialogPropsUpdater<K extends DialogType> =
  | PropsOf<K>
  | ((prev: PropsOf<K> | null) => PropsOf<K>);
/** 构造 dialog.open options */
type OpenDialogOmitProps =
  | 'open'
  | 'children'
  | 'onClose'
  | '_managedByProvider'
  | '_afterClosePromise'
  | '_setAfterClosePromise';
type OpenDialogTypeOptions = Omit<DialogProps, OpenDialogOmitProps>;

/** 弹框实例 */
export type DialogInstance<K extends DialogType = DialogType> = {
  key: string;
  type: K;
  zIndex: number;
  closeOnPopstate: boolean;
  props: PropsOf<K>;
  content: ReactNode;
  requestClose: () => void;
  updateProps: (updater: DialogPropsUpdater<K>) => void;
  /** 内部字段：存储最新的 onAfterClose 回调 */
  _onAfterClose?: (event: DialogAfterCloseEvent) => void;
  /** 内部字段：动画结束 promise */
  _afterClosePromise?: Promise<void>;
  /** 内部字段：Dialog ref，用于直接控制关闭 */
  _dialogRef?: React.RefObject<DialogRef | null>;
};

/** DialogContext */
export type DialogContextValue = {
  open: <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => DialogInstance<K>;

  queue: <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => Promise<void>;

  updateProps: <K extends DialogType>(type: K, updater: DialogPropsUpdater<K>) => void;

  closeTop: () => void;
  close: (type?: DialogType) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

/** Hook 使用 */
export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialogContext must be used within DialogProvider');
  return ctx;
};

// 全局 dialog 实例
let globalDialogInstance: DialogContextValue | null = null;
export const getGlobalDialog = () => {
  if (!globalDialogInstance) {
    throw new Error('DialogProvider 尚未初始化，无法使用全局 dialog');
  }
  return globalDialogInstance;
};

/** DialogProvider */
export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);
  const dialogsRef = useRef<DialogInstance[]>([]);
  const zIndexBaseRef = useRef(ZIndex.Dialog);

  // 更新 dialogs 数组
  const updateDialogs = useCallback(
    (updater: (prev: DialogInstance<DialogType>[]) => DialogInstance<DialogType>[]) => {
      setDialogs((prev) => {
        const next = updater(prev);
        dialogsRef.current = next;
        return next;
      });
    },
    [],
  );

  // popstate（系统关闭）
  useEffect(() => {
    const handlePopstate = () => {
      dialogsRef.current.forEach((d) => {
        if (d.closeOnPopstate) {
          d._dialogRef?.current?.setIsExiting('popstate');
        }
      });
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  /** open 方法 */
  const open = <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ): DialogInstance<K> => {
    const { props, onAfterClose, closeOnPopstate = true, ...dialogProps } = options ?? {};

    // 计算初始 props
    const initialProps =
      typeof props === 'function'
        ? (props as (prev: PropsOf<K> | null) => PropsOf<K>)(null)
        : props;

    // 检查已存在实例
    const existing = dialogsRef.current.find((d) => d.type === type);
    if (!dialogProps.multiple && existing) {
      if (props !== undefined) existing.updateProps(props as DialogPropsUpdater<DialogType>);
      existing._onAfterClose = onAfterClose;
      return existing as unknown as DialogInstance<K>;
    }

    const loader = dialogRegistry[type];
    if (!loader) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = createDialogId();

    const instance: DialogInstance<typeof type> & {
      _onAfterClose?: (event: DialogAfterCloseEvent) => void;
    } = {
      key: dialogKey,
      type,
      props: initialProps as PropsOf<typeof type>,
      zIndex: Math.min(zIndexBaseRef.current++, 9999),
      closeOnPopstate,
      content: null,
      requestClose: () => {},
      updateProps: () => {},
      _onAfterClose: onAfterClose,
    };

    // Dialog ref
    const dialogRef = React.createRef<DialogRef | null>();
    instance._dialogRef = dialogRef;

    instance.requestClose = () => {
      dialogRef.current?.setIsExiting('manual');
    };

    const LazyComponent = lazy(
      loader as unknown as () => Promise<{
        default: React.ComponentType<Record<string, unknown>>;
      }>,
    );
    const renderElement = (componentProps: PropsOf<typeof type>) => {
      const resolvedProps = (componentProps ?? {}) as Record<string, unknown>;

      return (
        <Suspense fallback={null}>
          <LazyComponent {...resolvedProps} />
        </Suspense>
      );
    };

    instance.content = (
      <Dialog
        ref={dialogRef}
        key={dialogKey}
        {...dialogProps}
        dialogId={dialogProps.dialogId ?? dialogProps.dataName ?? String(type)}
        closeOnPopstate={closeOnPopstate}
        _managedByProvider
        _setAfterClosePromise={(p) => {
          instance._afterClosePromise = p;
        }}
        onAfterClose={(event) => {
          updateDialogs((prev) => prev.filter((d) => d.key !== dialogKey));
          instance._onAfterClose?.(event);
        }}
      >
        {renderElement(instance.props)}
      </Dialog>
    );

    // updateProps 方法
    instance.updateProps = (updater) => {
      updateDialogs((prev) =>
        prev.map<DialogInstance<DialogType>>((d) => {
          if (d.key !== dialogKey) return d;

          const prevProps = d.props as PropsOf<typeof type>;
          const nextProps = (
            typeof updater === 'function'
              ? (updater as (p: PropsOf<typeof type> | null) => PropsOf<typeof type>)(prevProps)
              : Object.assign({}, prevProps, updater)
          ) as PropsOf<typeof type>;

          if (!React.isValidElement(d.content)) {
            return { ...d, props: nextProps as PropsOf<DialogType> };
          }

          const parent = d.content as ReactElement<{ children?: ReactNode }>;

          return {
            ...d,
            props: nextProps as PropsOf<DialogType>,
            content: React.cloneElement(parent, {}, renderElement(nextProps)),
          };
        }),
      );
    };

    updateDialogs((prev) => [...prev, instance as DialogInstance<DialogType>]);

    return instance;
  };

  /** queue 方法 */
  const queue = async <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => {
    return new Promise<void>((resolve) => {
      open(type, {
        ...options,
        onAfterClose(event) {
          options?.onAfterClose?.(event);
          resolve();
        },
      });
    });
  };

  /** closeTop */
  const closeTop = () => dialogsRef.current.at(-1)?.requestClose();

  /** close */
  const close = async (type?: DialogType) => {
    const promises: Promise<void>[] = [];
    dialogsRef.current
      .filter((d) => !type || d.type === type)
      .forEach((d) => {
        d.requestClose();
        if (d._afterClosePromise) promises.push(d._afterClosePromise);
      });
    await Promise.all(promises);
  };

  /** updateProps */
  const updateProps = <K extends DialogType>(type: K, updater: DialogPropsUpdater<K>) => {
    const dialog = dialogsRef.current.find((d) => d.type === type) as DialogInstance<K> | undefined;
    dialog?.updateProps(updater);
  };

  const dialogValue: DialogContextValue = { open, queue, closeTop, close, updateProps };
  globalDialogInstance = dialogValue;

  const dialogContent = useMemo(() => dialogs.map((d) => d.content), [dialogs]);

  return (
    <DialogContext.Provider value={dialogValue}>
      {children}
      {dialogContent}
    </DialogContext.Provider>
  );
};
