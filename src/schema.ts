import type { NextFunction, Request, Response } from "express";

//提供显示转换功能
// 即可以把一个字符串转换为number

export type Schema =
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "snumber" // 字符串数字 & 数字
  | "snumber?"
  | "number[]"
  | "number[]?"
  | "string[]"
  | "string[]?"
  | "array"
  | "array?"
  | RegExp;

interface IError {
  path: string;
  expect: string;
  have: string;
  msg?: string;
}

type Rule =
  | Schema
  | {
      type?: Schema;
      msg?: string;
      validate?: (val: any, req?: Request) => boolean;
    };

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("param");

function createSchema(source: "body" | "query" | "param") {
  return (opt: { [key: string]: Rule }): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors: IError[] = [];
        for (let key in opt) {
          const [rule, value] = [opt[key], req[source][key]];

          const expect =
            rule instanceof RegExp
              ? rule
              : typeof rule === "object"
              ? rule.type
              : rule;

          const msg =
            typeof rule === "object" && "msg" in rule ? rule.msg : undefined;

          let hit = true;
          if (expect instanceof RegExp) {
            hit = expect.test(value);
          } else if (expect) {
            hit = hits[expect](value);
          } else {
            if (typeof rule === "object" && "validate" in rule) {
              hit = rule.validate!(value, req);
            }
          }

          if (!hit) {
            errors.push({
              path: source + "." + key,
              expect: expect?.toString() || "custom",
              have: value === undefined ? "undefined" : value,
              msg,
            });
          }
        }
        if (errors.length > 0) {
          return res.status(400).json({ code: 400, errors });
        }
        await originalMethod.bind(this)(req, res, next);
      };
      return descriptor;
    };
}

const hits: {
  [key in Exclude<Schema, RegExp>]: (val: any) => boolean;
} = {
  string: (val) => typeof val === "string",
  "string?": (val) => val === undefined || hits.string(val),
  number: (val) => typeof val === "number",
  "number?": (val) => val === undefined || hits.number(val),
  snumber: (val) =>
    typeof val === "number" ||
    (typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val))),
  "snumber?": (val) => val === undefined || hits.snumber(val),
  "number[]": (val) => Array.isArray(val) && val.every((v) => hits.number(v)),
  "number[]?": (val) => val === undefined || hits["number[]"](val),
  "string[]": (val) => Array.isArray(val) && val.every((v) => hits.string(v)),
  "string[]?": (val) => val === undefined || hits["string[]"](val),
  array: (val) => Array.isArray(val),
  "array?": (val) => val === undefined || hits.array(val),
};
