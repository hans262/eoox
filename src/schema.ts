import type { NextFunction, Request, Response } from "express";

type Rule =
  | "string"
  | "number"
  | "snumber" // '123' | number
  | "number[]"
  | "string[]"
  | "array"
  | "boolean"
  | "sboolean" // 'true' | 'false' | boolean
  | RegExp
  | ((val: any, req?: Request) => boolean) // custom validate
  | (string | number)[]; // enum tuple

interface Schema {
  type: Rule;
  msg?: string;
  optional?: boolean;
  min?: number;
  max?: number; // string:length | number:size
  defaultValue?: any;
}
type Source = Rule | Schema;

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

function createSchema(role: "body" | "query" | "params") {
  return (opt: { [key: string]: Source }): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors: IError[] = [];
        for (let key in opt) {
          const [source, value] = [opt[key], req[role][key]];
          const schema =
            source instanceof RegExp
              ? { type: source }
              : source instanceof Function
              ? { type: source }
              : source instanceof Array
              ? { type: source }
              : source instanceof Object
              ? source
              : { type: source };

          const { type, optional, msg, defaultValue } = schema;
          let hit = true;
          const expect: IError["expect"] = { type: type.toString() };

          if (optional && value === undefined) {
            //处理可选
            hit = true;
            if (defaultValue !== undefined) {
              req[role][key] = defaultValue;
            }
          } else if (type instanceof Array) {
            //处理枚举
            hit = type.includes(value);
            expect.type = type;
          } else if (type instanceof RegExp) {
            hit = value === undefined ? false : type.test(value);
          } else if (type instanceof Function) {
            hit = type.bind(this)(value, req);
          } else {
            hit = hits[type](value, schema);
          }

          if (!hit) {
            typeof schema.min === "number" && (expect.min = schema.min);
            typeof schema.max === "number" && (expect.max = schema.max);
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
  [key in Exclude<
    Rule,
    RegExp | ((val: any, req?: Request) => boolean) | (string | number)[]
  >]: (val: any, schema: Schema) => boolean;
} = {
  string: (val, schema) => {
    if (typeof val === "string") {
      if (typeof schema.max === "number" && val.length > schema.max) {
        return false;
      }
      if (typeof schema.min === "number" && val.length < schema.min) {
        return false;
      }
      return true;
    }
    return false;
  },
  number: (val, schema) => {
    if (typeof val === "number") {
      if (typeof schema.max === "number" && val > schema.max) {
        return false;
      }
      if (typeof schema.min === "number" && val < schema.min) {
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
    Array.isArray(val) && val.every((v) => typeof v === "number"),
  "string[]": (val) =>
    Array.isArray(val) && val.every((v) => typeof v === "string"),
  array: (val) => Array.isArray(val),
  boolean: (val) => typeof val === "boolean",
  sboolean: (val) =>
    val === "true" || val === "false" || typeof val === "boolean",
};
