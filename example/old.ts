// 验证方法
// function validators(schema: Schema, value: any) {
//   const { type, optional, defaultValue } = schema;
//   let hit = true;

//   const expect: IError["expect"] = { type: type.toString() };
//   if (
//     value === undefined &&
//     (optional === true || defaultValue !== undefined)
//   ) {
//     //可选
//     // hit = true;
//     if (defaultValue !== undefined) {
//       //设置默认值
//       // req[mode][key] = defaultValue;
//     }
//   } else if (type instanceof Array) {
//     //枚举
//     hit = type.includes(value);
//     expect.type = type;
//   } else if (type instanceof RegExp) {
//     hit = value === undefined ? false : type.test(value);
//   } else if (type instanceof Function) {
//     // hit = type.bind(this)(value, req);
//     // 丢弃了this 和 req 传参
//     hit = type(value);
//   } else {
//     hit = hits[type](value, schema);
//   }

//   if (!hit) {
//     typeof schema.min === "number" && (expect.min = schema.min);
//     typeof schema.max === "number" && (expect.max = schema.max);
//     return expect;
//   }
// }

// const hits: {
//   [key in Exclude<
//     Rule,
//     RegExp | ((val: any, req?: Request) => boolean) | (string | number)[]
//   >]: (val: any, schema: Schema) => boolean;
// } = {
//   string: (val, schema) => {
//     if (typeof val === "string") {
//       if (typeof schema.max === "number" && val.length > schema.max) {
//         return false;
//       }
//       if (typeof schema.min === "number" && val.length < schema.min) {
//         return false;
//       }
//       return true;
//     }
//     return false;
//   },
//   number: (val, schema) => {
//     if (typeof val === "number") {
//       if (typeof schema.max === "number" && val > schema.max) {
//         return false;
//       }
//       if (typeof schema.min === "number" && val < schema.min) {
//         return false;
//       }
//       return true;
//     }
//     return false;
//   },
//   snumber: (val) =>
//     typeof val === "string" && val.length > 0 && !Number.isNaN(Number(val)),
//   "number[]": (val) =>
//     Array.isArray(val) && val.every((v) => typeof v === "number"),
//   "string[]": (val) =>
//     Array.isArray(val) && val.every((v) => typeof v === "string"),
//   array: (val) => Array.isArray(val),
//   boolean: (val) => typeof val === "boolean",
//   sboolean: (val) => ["true", "false"].includes(val),
//   object: (val, schema) => {
//     if (Object.prototype.toString.call(val) === "[object Object]") {
//       if (schema.fields) {
//         for (const key in schema.fields) {
//           if (schema.fields.hasOwnProperty(key)) {
//             const fieldSchema = schema.fields[key];
//             const fieldValue = val[key];
//             if (validators(fieldSchema, fieldValue)) {
//               return false;
//             }
//           }
//         }
//       }
//       return true;
//     }
//     return false;
//   },
// };

// const { type, optional, msg, defaultValue } = schema;
//           let hit = true;
//           const expect: IError["expect"] = { type: type.toString() };

//           if (
//             value === undefined &&
//             (optional === true || defaultValue !== undefined)
//           ) {
//             //可选
//             hit = true;
//             if (defaultValue !== undefined) {
//               req[mode][key] = defaultValue;
//             }
//           } else if (type instanceof Array) {
//             //枚举
//             hit = type.includes(value);
//             expect.type = type;
//           } else if (type instanceof RegExp) {
//             hit = value === undefined ? false : type.test(value);
//           } else if (type instanceof Function) {
//             hit = type.bind(this)(value, req);
//           } else {
//             hit = hits[type](value, schema);
//           }

//           if (!hit) {
//             typeof schema.min === "number" && (expect.min = schema.min);
//             typeof schema.max === "number" && (expect.max = schema.max);
//             errors.push({
//               path: mode + "." + key,
//               expect,
//               have: value === undefined ? "undefined" : value,
//               msg,
//             });
//           }
