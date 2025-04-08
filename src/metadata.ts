import type { Express } from "express";
import { posix } from "node:path";
import { SchemaOptions } from "./builder.js";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export interface Metadata {
  /**控制器对象名称 */
  constructorName: string;
  /**函数名称 */
  functionName: string | symbol;

  /**请求类型 */
  method?: Method;
  /**方法路径 */
  mpath?: string;

  /**路由注册后才有 */
  path?: string;
  /**参数 */
  params?: SchemaOptions;
  /**请求体 */
  body?: SchemaOptions;
  /**查询参数 */
  query?: SchemaOptions;
}

/**
 * 元数据仓库
 */
export const metadatas: Metadata[] = [];

export function pushMeta(
  constructorName: Metadata["constructorName"],
  functionName: Metadata["functionName"],
  keyv: Omit<Metadata, "constructorName" | "functionName">
) {
  let meta = metadatas.find(
    (m) =>
      m.constructorName === constructorName && m.functionName === functionName
  );

  if (!meta) {
    meta = {
      constructorName,
      functionName,
    };
    metadatas.push(meta);
  }

  for (let key in keyv) {
    meta[key as keyof Metadata] = (keyv as any)[key];
  }
}

/**
 * 安装控制器
 * @param prefix api前缀
 * @param controllers 控制器集合
 */
export const use = (prefix: string, ...controllers: (new () => any)[]) => {
  for (const c of controllers) {
    const items = metadatas.filter((m) => m.constructorName === c.name);
    const instance = new c();

    for (const item of items) {
      if (!item.method) continue;
      const path = posix.join("/", prefix, item.mpath || "");
      const app = use.app;
      if (!app) {
        throw new Error("请先调用 use.setup(app) 方法设置 app");
      }
      // 自动收集中间件异常 express v5已经包含该功能
      app[item.method](path, async (req, res, next) => {
        try {
          await instance[item.functionName].bind(instance)(req, res, next);
        } catch (err) {
          next(err);
        }
      });
      item.path = path;
    }
  }
};

use.app = null as Express | null;
use.setup = function (app: Express) {
  use.app = app;
};

/**
 * symbol 函数名
 */
export function sfn() {
  return Symbol();
}
