import type { Express } from "express";
import { posix } from "node:path";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export interface Metadata {
  /**控制器path，必传，不安装控制器装饰器，可能为undefined */
  cpath?: string;
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
 */
export const useController = (
  app: Express,
  prefix: string,
  controllers: (new () => any)[]
) => {
  for (const c of controllers) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    for (const item of items) {
      if (item.instance && item.cpath) {
        const path = posix.join("/", prefix, item.cpath, item.mpath!);
        // 自动收集中间件、异常
        app[item.method](path, async (req, res, next) => {
          try {
            await item.instance[item.functionName].bind(item.instance)(
              req,
              res,
              next
            );
          } catch (err) {
            next(err);
          }
        });
      }
    }
  }
};

/**
 * 生成唯一函数名
 */
export function randomfn() {
  // const ext = Math.random().toString(32).substring(2, 16);
  // const fn = "fn_" + Date.now() + "_" + ext;
  return Symbol();
}
