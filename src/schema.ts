import type { NextFunction, Request, Response } from "express";

export type Ischema =
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "snumber" // number | 可转数字的字符串
  | "snumber?";

//字符串最小长度

interface IError {
  path: string;
  expect: string;
  have: string;
}

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("param");

function createSchema(ip: "body" | "query" | "param") {
  return (schema: { [key: string]: Ischema }): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors: IError[] = [];
        for (let sk in schema) {
          let iis;
          if ((iis = is(sk, schema[sk], req[ip][sk]))) {
            errors.push(iis);
          }
        }

        if (errors.length) {
          return res.json({ code: 400, msg: "参数错误", errors });
        }
        await originalMethod.bind(this)(req, res, next);
      };
      return descriptor;
    };
}

function is(key: string, sc: Ischema, value: any): IError | false {
  if (sc === "string" && typeof value === "string") {
    return false;
  }

  if (sc === "string?") {
    if (value === undefined) {
      return false;
    } else if (typeof value === "string") {
      return false;
    }
  }

  if (sc === "number" && typeof value === "number") {
    return false;
  }

  if (sc === "number?") {
    if (value === undefined) {
      return false;
    } else if (typeof value === "number") {
      return false;
    }
  }

  if (sc === "snumber") {
    if (typeof value === "number") {
      return false;
    } else if (typeof value === "string" && !isNaN(Number(value))) {
      return false;
    }
  }

  if (sc === "snumber?") {
    if (value === undefined || typeof value === "number") {
      return false;
    } else if (typeof value === "string" && !isNaN(Number(value))) {
      return false;
    }
  }

  return { path: key, expect: sc, have: typeof value };
}
