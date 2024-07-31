import { z } from "zod";
import { metadatas, Method } from "./metadata.js";
import type { Response, Request, NextFunction } from "express";

export function Controller(cpath: string): ClassDecorator {
  return (constructor: any) => {
    const instance = new constructor();
    for (let i = 0; i < metadatas.length; i++) {
      const item = metadatas[i];
      if (item.constructorName === constructor.name) {
        item.cpath = cpath;
        item.instance = instance;
      }
    }
  };
}

function createMethodDecorator(method: Method) {
  return (mpath = ""): MethodDecorator =>
    (target, propertyKey) => {
      const meta = metadatas.find(
        (m) =>
          m.constructorName === target.constructor.name &&
          m.functionName === propertyKey
      );
      if (meta) {
        meta.method = method;
        meta.mpath = mpath;
      } else {
        metadatas.push({
          method,
          mpath,
          functionName: propertyKey,
          constructorName: target.constructor.name,
        });
      }
    };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Delete = createMethodDecorator("delete");
export const Patch = createMethodDecorator("patch");

type IMiddleware = (req: Request, res: Response, next: NextFunction) => any;

/**
 * 拦截装饰器
 * @param tf
 */
export function Off(tf: IMiddleware): MethodDecorator {
  return (_, __, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      await tf(req, res, async () => {
        try {
          await originalMethod.bind(this)(req, res, next);
        } catch (err) {
          next(err);
        }
      });
    };
    return descriptor;
  };
}

/**
 * zod验证装饰器
 * @param schema
 */
export function Validate(
  schema: z.ZodObject<any>,
  requestPart: "body" | "query" | "params"
): MethodDecorator {
  return (_, __, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        schema.parse(req[requestPart]);
        await originalMethod.bind(this)(req, res, next);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          res.json({ code: 400, msg: "参数错误", errors: error.issues });
        } else {
          throw new Error(error);
        }
      }
    };
    return descriptor;
  };
}
