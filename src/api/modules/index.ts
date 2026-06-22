/**
 * 领域 API 模块。
 *
 * 将接口路径收敛在模块内部，让应用代码导入业务函数，避免在组件里散落后端路径。
 */
import * as example from './example';
import * as product from './product';

export { example, product };
