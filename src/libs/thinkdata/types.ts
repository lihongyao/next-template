type BaseReportProps = {
  // 引流类型，链接参数取，存 sessionStorage
  ad_type?: string;
  // 具体引流行为标识，链接参数取，存 sessionStorage
  ad_id?: string;
  // 来源页面标识
  from_path?: string;
  // 页面唯一标识
  page_key?: string;
};

type BasePageReportProps = BaseReportProps & {
  // 页面类型
  page_type?: 'page' | 'dialog';
  // 页面强制标识（只针对弹窗）—— true 强推 / false 弱推
  page_forced_status?: boolean;
  // 页面前置校验条件（只针对弹窗）
  page_condition?: 'home' | 'login' | 'deposit' | 'withdraw';
};
export type ReportPageVisitProps = BasePageReportProps;
export type ReportPageScrollProps = BasePageReportProps;
export type ReportPageExitProps = BasePageReportProps & { stay_time: number };

type BaseComponentReportProps = BaseReportProps & {
  // 组件唯一标识
  component_key: string;
  // 组件类型
  component_type: string;
};

export type ReportComponentExposureProps = BaseComponentReportProps;

export type ReportComponentClickProps = BaseComponentReportProps & {
  // 组件内序号（从1开始）
  position_index: number;
  // 组件触发对象的业务id
  position_value: string;
};

export type ReportComponentScrollProps = BaseComponentReportProps;

export type Report = {
  page_visit: ReportPageVisitProps;
  page_scroll: ReportPageScrollProps;
  page_exit: ReportPageExitProps;
  component_exposure: ReportComponentExposureProps;
  component_click: ReportComponentClickProps;
  component_scroll: ReportComponentScrollProps;
};
