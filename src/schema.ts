import type { NextFunction, Request, Response } from "express";
import {
  builderToSchema,
  Schema,
  SchemaBuilderOptions,
  SchemaOptions,
} from "./builder.js";
import { pushMeta } from "./metadata.js";

export const Query = createSchema("query");
export const Body = createSchema("body");
export const Param = createSchema("params");

function createSchema(mode: "body" | "query" | "params") {
  return (opt: SchemaBuilderOptions): MethodDecorator =>
    (target, propertyKey, descriptor: PropertyDescriptor) => {
      const opts = builderToSchema(opt);
      pushMeta(target.constructor.name, propertyKey, { [mode]: opts });

      const originalMethod = descriptor.value;
      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        const errors = [] as IError[];
        const map = parseOpt(opts);
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

function parseOpt(
  opt: SchemaOptions,
  parentKeys: string[] = [],
  parentSchema?: Schema
) {
  const map = new Map<string[], Schema>();
  for (let key in opt) {
    const mapKey = parentKeys.concat(key);
    const schema = opt[key];

    // 将父 Schema 赋值给当前 Schema
    schema.parent = parentSchema;

    map.set(mapKey, schema);
    if (schema.fields) {
      let tmp = parseOpt(schema.fields, mapKey, schema);
      for (const [key, value] of tmp) {
        map.set(key, value);
      }
    }
  }
  return map;
}

interface IError {
  path: string;
  expect: Omit<Schema, "pattern" | "validate"> & {
    pattern?: string | RegExp;
    validate?: string | Function;
  };
  have: string;
  msg?: string;
}

class Validator {
  hit = true; // 是否通过
  error: IError;
  constructor(
    schema: Schema,
    private req: Request,
    private mode: "body" | "query" | "params",
    private keys: string[],
    private self: any
  ) {
    const value = this.getValueByKeys(keys);
    this.error = {
      path: mode + "." + keys.join("."),
      expect: { ...schema },
      have: value === undefined ? "undefined" : value,
      msg: schema.errMsg,
    };

    if (schema.rule === "func") {
      this.error.expect.validate = schema.validate.toString();
    } else {
      delete this.error.expect.validate;
    }

    if (schema.pattern) {
      this.error.expect.pattern = schema.pattern.toString();
    }

    delete this.error.expect.parent;
    delete this.error.expect.fields;
    delete this.error.expect.errMsg;
    // console.log(this.error.expect);
    this.hit = this.checkHit(schema, value);
  }

  private getValueByKeys(keys: string[]) {
    let current = this.req[this.mode];
    for (const key of keys) {
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
    const { optional, defaultValue, rule, nullable } = schema;
    let hit = true;

    // 如果父键的值不存在，则直接跳出检查，默认通过
    if (schema.parent) {
      const parentKeys = this.keys.slice(0, -1);
      const parentValue = this.getValueByKeys(parentKeys);
      if (parentValue === undefined) {
        return hit;
      }
    }

    //可选，设置默认值
    if (value === undefined && optional === true) {
      if (defaultValue !== undefined) {
        this.setValueByKeys(defaultValue);
      }

      return hit;
    }

    //允许null值
    if (value === null && nullable === true) {
      return hit;
    }

    if (rule === "func") {
      hit = schema.validate.bind(this.self)(value, this.req);
    } else {
      hit = schema.validate(value);
    }

    return hit;
  }
}
