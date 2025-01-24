import type { NextFunction, Request, Response } from "express";

type Rule =
  | "string"
  | "number"
  | "snumber" // '123'
  | "number[]"
  | "string[]"
  | "array"
  | "boolean"
  | "sboolean" // 'true' | 'false'
  | "object"
  | RegExp
  | ((val: any, req?: Request) => boolean) // custom validate
  | (string | number)[]; // enum

interface Schema {
  type: Rule;
  msg?: string;
  optional?: boolean;
  min?: number;
  max?: number; // string:length | number:size
  defaultValue?: any;
  fields?: SchemaOptions;
}

interface SchemaOptions {
  [key: string]: Schema | Rule;
}

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("params");

function createSchema(mode: "body" | "query" | "params") {
  return (opt: SchemaOptions): MethodDecorator =>
    (_, __, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors = [] as IError[];
        const map = parseOpt(opt);
        // console.log(Array.from(map));
        for (const [keys, schema] of map) {
          const valid = new Validator(schema, req, mode, keys, this);
          if (!valid.hit) {
            errors.push(valid.error);
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

function parseOpt(opt: SchemaOptions, parentKeys: string[] = []) {
  const map = new Map<string[], Schema>();
  for (let key in opt) {
    const mapKey = parentKeys.concat(key);
    const source = opt[key];
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

    map.set(mapKey, schema);
    if (schema.fields) {
      let tmp = parseOpt(schema.fields, mapKey);
      for (const [key, value] of tmp) {
        map.set(key, value);
      }
    }
  }
  return map;
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

class Validator {
  hit = true; // 默认验证通过
  error: IError; // 预期错误类型
  constructor(
    private schema: Schema,
    private req: Request,
    private mode: "body" | "query" | "params",
    private keys: string[],
    private self: any
  ) {
    const value = this.getValueByKeys();
    this.error = {
      path: mode + "." + keys.join("."),
      expect: { type: schema.type.toString() },
      have: value === undefined ? "undefined" : value,
      msg: schema.msg,
    };
    this.hit = this.checkHit(schema, value);
  }

  private getValueByKeys() {
    let current = this.req[this.mode];
    for (const key of this.keys) {
      if (current && current.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private setValueByKeys(defaultValue: any) {
    let current = this.req[this.mode];
    const keys = this.keys;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current.hasOwnProperty(key) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    current[lastKey] = defaultValue;
  }

  private checkHit(schema: Schema, value: any) {
    const { type, optional, defaultValue } = schema;
    let hit = true;
    if (
      value === undefined &&
      (optional === true || defaultValue !== undefined)
    ) {
      //可选
      if (defaultValue !== undefined) {
        //设置默认值
        this.setValueByKeys(defaultValue);
      }
    } else if (type instanceof Array) {
      //枚举
      hit = type.includes(value);
      this.error.expect.type = type;
    } else if (type instanceof RegExp) {
      hit = value === undefined ? false : type.test(value);
    } else if (type instanceof Function) {
      hit = type.bind(this.self)(value, this.req);
    } else {
      hit = this[type](value);
    }
    return hit;
  }

  string(val: any) {
    const schema = this.schema;
    if (typeof val === "string") {
      if (typeof schema.max === "number" && val.length > schema.max) {
        this.error.expect.max = schema.max;
        return false;
      }
      if (typeof schema.min === "number" && val.length < schema.min) {
        this.error.expect.min = schema.min;
        return false;
      }
      return true;
    }
    return false;
  }

  number(val: any) {
    const schema = this.schema;
    if (typeof val === "number") {
      if (typeof schema.max === "number" && val > schema.max) {
        this.error.expect.max = schema.max;
        return false;
      }
      if (typeof schema.min === "number" && val < schema.min) {
        this.error.expect.min = schema.min;
        return false;
      }
      return true;
    }
    return false;
  }

  snumber(val: any) {
    return (
      typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val))
    );
  }

  "number[]"(val: any) {
    return Array.isArray(val) && val.every((v) => typeof v === "number");
  }

  "string[]"(val: any) {
    return Array.isArray(val) && val.every((v) => typeof v === "string");
  }

  array(val: any) {
    return Array.isArray(val);
  }

  boolean(val: any) {
    return typeof val === "boolean";
  }

  sboolean(val: any) {
    return ["true", "false"].includes(val);
  }

  object(val: any) {
    return Object.prototype.toString.call(val) === "[object Object]";
  }
}
