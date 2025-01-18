import type { NextFunction, Request, Response } from "express";

type Schema =
  | "string"
  | "number"
  | "snumber" // '123' | number
  | "number[]"
  | "string[]"
  | "array"
  | "boolean"
  | "sboolean" // 'true' | 'false' | boolean
  | RegExp
  | SchemaFn
  | SchemaEnum;

type SchemaFn = (val: any, req?: Request) => boolean;
type SchemaEnum = (string | number)[];
interface Rule {
  type: Schema;
  msg?: string;
  optional?: boolean;
  min?: number;
  max?: number; // string:length | number:size
  defaultValue?: any;
}

interface IError {
  path: string;
  expect: {
    type: string | any[];
    min?: number;
    max?: number;
  };
  have: string;
  msg?: string;
}

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("params");

function createSchema(source: "body" | "query" | "params") {
  return (opt: { [key: string]: Rule | Schema }): MethodDecorator =>
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
          const _rule =
            rule instanceof RegExp
              ? { type: rule }
              : rule instanceof Function
              ? { type: rule }
              : rule instanceof Array
              ? { type: rule }
              : rule instanceof Object
              ? rule
              : { type: rule };

          const { type: schema, optional, msg, defaultValue } = _rule;
          let hit = true;
          const expect: IError["expect"] = { type: schema.toString() };

          if (optional && value === undefined) {
            //处理可选
            hit = true;
            if (defaultValue !== undefined) {
              req[source][key] = defaultValue;
            }
          } else if (schema instanceof Array) {
            //处理枚举
            hit = schema.includes(value);
            expect.type = schema;
          } else if (schema instanceof RegExp) {
            hit = value === undefined ? false : schema.test(value);
          } else if (schema instanceof Function) {
            hit = schema.bind(this)(value, req);
          } else {
            hit = hits[schema](value, _rule);
          }

          if (!hit) {
            typeof _rule.min === "number" && (expect.min = _rule.min);
            typeof _rule.max === "number" && (expect.max = _rule.max);
            errors.push({
              path: source + "." + key,
              expect,
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
  [key in Exclude<Schema, RegExp | SchemaFn | SchemaEnum>]: (
    val: any,
    rule: Rule
  ) => boolean;
} = {
  string: (val, rule) => {
    if (typeof val === "string") {
      if (typeof rule.max === "number" && val.length > rule.max) {
        return false;
      }
      if (typeof rule.min === "number" && val.length < rule.min) {
        return false;
      }
      return true;
    }
    return false;
  },
  number: (val, rule) => {
    if (typeof val === "number") {
      if (typeof rule.max === "number" && val > rule.max) {
        return false;
      }
      if (typeof rule.min === "number" && val < rule.min) {
        return false;
      }
      return true;
    }
    return false;
  },
  snumber: (val) =>
    typeof val === "number" ||
    (typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val))),
  "number[]": (val) =>
    Array.isArray(val) && val.every((v) => typeof val === "number"),
  "string[]": (val) =>
    Array.isArray(val) && val.every((v) => typeof val === "string"),
  array: (val) => Array.isArray(val),
  boolean: (val) => typeof val === "boolean",
  sboolean: (val) =>
    val === "true" || val === "false" || typeof val === "boolean",
};
