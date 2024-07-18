import type { Express } from "express";
import { posix } from "node:path";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export interface Metadata {
  /**控制器路径，必传参数，不能为空字符串 */
  cpath: string;
  /**方法路径，默认值 = '' */
  mpath?: string;
  /**控制器对象名称 */
  constructorName: string;
  /**请求类型 */
  method: Method;
  /**函数名称 */
  functionName: string | symbol;
  /**控制器对象实例，挂装饰器才会有 */
  instance?: any;
}

/**
 * 元数据仓库
 */
export const metadatas: Metadata[] = [];

/**
 * 安装控制器
 * @param app Express实例
 * @param prefix api前缀
 * @param controllers 控制器集合
 * @deprecated 请使用新的控制器注册函数，useEoox
 */
export const useControllers = (
  app: Express,
  prefix: string,
  controllers: (new () => any)[]
) => {
  for (const c of controllers) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    for (const item of items) {
      const path = posix.join("/", prefix, item.cpath, item.mpath!);
      if (item.instance) {
        app[item.method](
          path,
          item.instance[item.functionName].bind(item.instance)
        );
      }
    }
  }
};

/**
 * 安装控制器
 * @param app Express实例
 * @param prefix api前缀
 * @param controllers 控制器集合
 */
export const useEoox = (
  app: Express,
  prefix: string,
  controllers: (new () => any)[]
) => {
  for (const c of controllers) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    for (const item of items) {
      const path = posix.join("/", prefix, item.cpath, item.mpath!);
      if (item.instance) {
        // 为了支持express捕获异步错误的处理，express 5 已经完善了该功能
        app[item.method](path, (req, res, next) => {
          try {
            item.instance[item.functionName]
              .bind(item.instance)(req, res, next)
              ?.catch(next);
            //捕获异步错误
          } catch (err) {
            //捕获同步错误
            next(err);
          }
        });
      }
    }
  }
};
