import type { NextFunction, Request, Response } from "express";

type Schema =
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
  | RegExp
  | SchemaFn;

type SchemaFn = (val: any, req?: Request) => boolean;
type SchemaOpt = { type: Schema; msg?: string };
type Rule = Schema | SchemaOpt;

interface SError {
  path: string;
  expect: string;
  have: string;
  msg?: string;
}

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("params");

function createSchema(source: "body" | "query" | "params") {
  return (opt: { [key: string]: Rule }): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors: SError[] = [];
        for (let key in opt) {
          const [rule, value] = [opt[key], req[source][key]];
          const schema =
            rule instanceof RegExp
              ? rule
              : rule instanceof Function
              ? rule
              : rule instanceof Object
              ? rule.type
              : rule;

          let hit = true;
          if (schema instanceof RegExp) {
            hit = schema.test(value);
          } else if (schema instanceof Function) {
            hit = schema.bind(this)(value, req);
          } else {
            hit = hits[schema](value);
          }

          if (!hit) {
            errors.push({
              path: source + "." + key,
              expect: schema.toString(),
              have: value === undefined ? "undefined" : value,
              msg:
                typeof rule === "object" && "msg" in rule
                  ? rule.msg
                  : undefined,
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
  [key in Exclude<Schema, RegExp | SchemaFn>]: (val: any) => boolean;
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
