// -- 客户端环境变量
type ClientEnv = {
  NEXT_PUBLIC_ENV: 'dev' | 'stage' | 'prod';
  NEXT_PUBLIC_BRAND: string;
  NEXT_PUBLIC_API_HOST_S: string;
  NEXT_PUBLIC_API_HOST_C: string;
};

// -- 服务端环境变量
type ServerEnv = {
  ACCESS_TOKEN: string;
  [__key__: string]: unknown;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnv, ServerEnv {}
  }
}

export {};
