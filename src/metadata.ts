import type { Express } from "express";
import path from "node:path";

export type Method = "get" | "post" | "put" | "delete";

export interface Metadata {
  /**控制器对象上的path，必传参数 */
  cpath?: string;
  /**方法路径，可不传，默认值 = '' */
  mpath?: string;
  /**控制器对象名称 */
  constructorName: string;
  /**请求类型 */
  method?: Method;
  /**函数名称 */
  propertyKey: string | symbol;
  /**控制器对象实例，挂装饰器才会有 */
  instance?: any;
}

/**
 * 元数据仓库
 */
export const metadatas: Metadata[] = [];

/**
 * 安装控制器函数
 * @param app
 * @param prefix
 * @param cs
 */
export const useControllers = (
  app: Express,
  prefix: string,
  cs: (new () => any)[]
) => {
  for (const c of cs) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    for (const item of items) {
      if (!item.cpath || !item.mpath) continue;
      let _path = path.posix.join("/", prefix, item.cpath, item.mpath);
      app[item.method!](
        _path,
        item.instance[item.propertyKey].bind(item.instance)
      );
    }
  }
};
