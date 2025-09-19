import type { Request } from "express";

export interface Schema {
  rule:
    | "string"
    | "number"
    | "snumber" // '123'
    | "array"
    | "boolean"
    | "sboolean" // 'true' | 'false'
    | "object"
    | "enums"
    | "func";
  optional?: boolean; // undefind
  nullable?: boolean; // null
  errMsg?: string;
  defaultValue?: any;
  validate: (val: any, req?: Request) => boolean;

  min?: number;
  max?: number; // string:max-length | number:max-size
  length?: number; // string:length | array:length
  pattern?: RegExp; // string:pattern
  int?: boolean; // number:int

  fields?: { [key: string]: Schema };
  enums?: (string | number)[];
  item?: "number" | "string"; // array:item

  parent?: Schema;

  coerce?: "number" | "string"; // 是否强转 -> 目标类型
}

export interface SchemaBuilderOptions {
  [key: string]: SchemaBuilder;
}

export interface SchemaOptions {
  [key: string]: Schema;
}

export function builderToSchema(opt: SchemaBuilderOptions): SchemaOptions {
  let _fields: Schema["fields"] = {};
  for (let key in opt) {
    if (opt.hasOwnProperty(key)) {
      _fields[key] = opt[key].schema;
    }
  }
  return _fields;
}

export class SchemaBuilder {
  schema: Schema;
  constructor(rule: Schema["rule"]) {
    this.schema = {
      rule,
      validate: () => true,
    };
  }

  optional() {
    this.schema.optional = true;
    return this;
  }

  nullable() {
    this.schema.nullable = true;
    return this;
  }

  defaultValue(value: any) {
    this.schema.optional = true;
    this.schema.defaultValue = value;
    return this;
  }

  errMsg(msg: string) {
    this.schema.errMsg = msg;
    return this;
  }
}

class StringSchemaBuilder extends SchemaBuilder {
  min(min: number) {
    this.schema.min = min;
    return this;
  }

  max(max: number) {
    this.schema.max = max;
    return this;
  }

  pattern(pattern: RegExp) {
    this.schema.pattern = pattern;
    return this;
  }

  length(length: number) {
    this.schema.length = length;
    return this;
  }
}

class NumberSchemaBuilder extends SchemaBuilder {
  min(min: number) {
    this.schema.min = min;
    return this;
  }

  max(max: number) {
    this.schema.max = max;
    return this;
  }

  int() {
    this.schema.int = true;
    return this;
  }
}

class ArraySchemaBuilder extends SchemaBuilder {
  item(type: "number" | "string") {
    this.schema.item = type;
    return this;
  }

  length(length: number) {
    this.schema.length = length;
    return this;
  }
}

export const e = {
  coerce: {
    number() {
      const sb = e.number();
      sb.schema.coerce = "number";
      return sb;
    },
    string() {
      const sb = e.string();
      sb.schema.coerce = "string";
      return sb;
    },
  },

  string: function () {
    const sb = new StringSchemaBuilder("string");
    sb.schema.validate = function (val: any) {
      if (typeof val !== "string") {
        return false;
      }
      if (typeof this.max === "number" && val.length > this.max) {
        return false;
      }
      if (typeof this.min === "number" && val.length < this.min) {
        return false;
      }

      if (this.pattern) {
        return val === undefined ? false : this.pattern.test(val);
      }

      if (typeof this.length === "number" && val.length !== this.length) {
        return false;
      }

      return true;
    };

    return sb;
  },

  object: function (opt: SchemaBuilderOptions) {
    const sb = new SchemaBuilder("object");
    sb.schema.fields = builderToSchema(opt);
    sb.schema.validate = function (val: any) {
      return Object.prototype.toString.call(val) === "[object Object]";
    };
    return sb;
  },

  number: function () {
    const sb = new NumberSchemaBuilder("number");
    sb.schema.validate = function (val) {
      if (typeof val !== "number") {
        return false;
      }
      if (typeof this.max === "number" && val > this.max) {
        return false;
      }
      if (typeof this.min === "number" && val < this.min) {
        return false;
      }

      if (this.int && !Number.isInteger(val)) {
        return false;
      }

      return true;
    };

    return sb;
  },

  snumber: function () {
    const sb = new NumberSchemaBuilder("snumber");
    sb.schema.validate = function (val: any) {
      let hit =
        typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val));

      if (!hit) {
        return false;
      }

      if (typeof this.max === "number" && val > this.max) {
        return false;
      }

      if (typeof this.min === "number" && val < this.min) {
        return false;
      }

      if (this.int && !Number.isInteger(Number(val))) {
        return false;
      }

      return true;
    };
    return sb;
  },

  enums: function (...enums: (string | number)[]) {
    const sb = new SchemaBuilder("enums");
    sb.schema.enums = enums;
    sb.schema.validate = function (val: any) {
      return enums.includes(val);
    };
    return sb;
  },

  func: function (func: Schema["validate"]) {
    const sb = new SchemaBuilder("func");
    sb.schema.validate = func;
    return sb;
  },

  boolean: function () {
    const sb = new SchemaBuilder("boolean");
    sb.schema.validate = function (val: any) {
      return typeof val === "boolean";
    };
    return sb;
  },

  sboolean: function () {
    const sb = new SchemaBuilder("sboolean");
    sb.schema.validate = function (val: any) {
      return ["true", "false"].includes(val);
    };
    return sb;
  },

  array: function () {
    const sb = new ArraySchemaBuilder("array");
    sb.schema.validate = function (val: any) {
      let hit = true;
      if (!(hit = Array.isArray(val))) {
        return false;
      }
      if (this.item === "number") {
        hit = val.every((v) => typeof v === "number");
      }

      if (this.item === "string") {
        hit = val.every((v) => typeof v === "string");
      }

      if (typeof this.length === "number") {
        hit = val.length === this.length;
      }

      return hit;
    };
    return sb;
  },
};
