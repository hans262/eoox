import type { NextFunction, Request, Response } from "express";

export type Schema =
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "snumber" // 字符串数字 & 数字
  | "snumber?";

interface IError {
  path: string;
  expect: Schema;
  have: string;
}

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("param");

function createSchema(ip: "body" | "query" | "param") {
  return (schema: { [key: string]: Schema }): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors: IError[] = [];
        for (let sk in schema) {
          let [expect, value] = [schema[sk], req[ip][sk]];
          const hit = hits[expect](value);
          if (!hit) {
            errors.push({ path: sk, expect, have: typeof value });
          }
        }
        if (errors.length > 0) {
          return res.status(400).json({ code: 400, msg: "参数错误", errors });
        }
        await originalMethod.bind(this)(req, res, next);
      };
      return descriptor;
    };
}

const hits: { [key in Schema]: (val: any) => boolean } = {
  string: (val) => typeof val === "string",
  "string?": (val) => {
    return val === undefined || typeof val === "string";
  },
  number: (val) => typeof val === "number",
  "number?": (val) => val === undefined || typeof val === "number",
  snumber: (val) =>
    typeof val === "number" ||
    (typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val))),
  "snumber?": (val) =>
    val === undefined ||
    typeof val === "number" ||
    (typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val))),
};
