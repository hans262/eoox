import type { Express } from "express";
import { posix } from "node:path";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export interface Metadata {
  /**方法路径，默认值 = '' */
  mpath?: string;
  /**控制器对象名称 */
  constructorName: string;
  /**请求类型 */
  method: Method;
  /**函数名称 */
  functionName: string | symbol;
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
export const use = (
  app: Express,
  prefix: string,
  ...controllers: (new () => any)[]
) => {
  for (const c of controllers) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    const instance = new c();

    for (const item of items) {
      const path = posix.join("/", prefix, item.mpath!);
      // 自动收集中间件异常 express v5已经包含该功能
      app[item.method](path, async (req, res, next) => {
        try {
          await instance[item.functionName].bind(instance)(req, res, next);
        } catch (err) {
          next(err);
        }
      });
    }
  }
};

/**
 * symbol 函数名
 */
export function sfn() {
  return Symbol();
}
