// -- 客户端环境变量
type ClientEnv = {
  NEXT_PUBLIC_ENV: string;
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_BRAND_NAME: string;
};

// -- 服务端环境变量
type ServerEnv = {
  [__key: string]: unknown;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnv, ServerEnv {}
  }
}

export {};
