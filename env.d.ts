// -- 客户端环境变量
type ClientEnv = {
  // 环境
  NEXT_PUBLIC_ENV: string;
  // API 基础 URL
  NEXT_PUBLIC_API_HOST_S: string;
  NEXT_PUBLIC_API_HOST_C: string;
  // 品牌名称
  NEXT_PUBLIC_BRAND_NAME: string;
};

// -- 服务端环境变量
type ServerEnv = {
  [__key__: string]: unknown;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ClientEnv, ServerEnv {}
  }
}

export {};
