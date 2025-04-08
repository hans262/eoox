import { metadatas, Method, pushMeta } from "./metadata.js";
import type { Response, Request, NextFunction } from "express";

function createMethodDecorator(method: Method) {
  return (mpath?: string): MethodDecorator =>
    (target, propertyKey) => {
      pushMeta(target.constructor.name, propertyKey, {
        method,
        mpath,
      });
    };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Delete = createMethodDecorator("delete");
export const Patch = createMethodDecorator("patch");

type Middleware = (req: Request, res: Response, next: NextFunction) => any;

/**
 * 方法中间件
 * @param tf
 */
export function Use(tf: Middleware): MethodDecorator {
  return (_, __, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      await tf.bind(this)(req, res, async () => {
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
 * 控制器中间件
 * @param tf
 */
export function UseClass(tf: Middleware): ClassDecorator {
  return (target: any) => {
    const originalMethods = [
      ...Object.getOwnPropertyNames(target.prototype).filter(
        (name) => name !== "constructor"
      ),
      ...Object.getOwnPropertySymbols(target.prototype),
    ];
    originalMethods.forEach((methodName) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        methodName
      );

      if (descriptor && typeof descriptor.value === "function") {
        const meta = metadatas.find(
          (m) =>
            m.constructorName === target.name && m.functionName === methodName
        );
        if (meta) {
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
          Object.defineProperty(target.prototype, methodName, descriptor);
        }
      }
    });
  };
}
