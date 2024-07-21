import { metadatas, Method } from "./metadata.js";

export function Controller(cpath: string): ClassDecorator {
  return (constructor: any) => {
    const instance = new constructor();
    for (let i = 0; i < metadatas.length; i++) {
      const item = metadatas[i];
      if (item.constructorName === constructor.name) {
        item.cpath = cpath;
        item.instance = instance;
      }
    }
  };
}

function createMethodDecorator(method: Method) {
  return (mpath = ""): MethodDecorator =>
    (target, propertyKey) => {
      const meta = metadatas.find(
        (m) =>
          m.constructorName === target.constructor.name &&
          m.functionName === propertyKey
      );
      if (meta) {
        meta.method = method;
        meta.mpath = mpath;
      } else {
        metadatas.push({
          method,
          mpath,
          functionName: propertyKey,
          constructorName: target.constructor.name,
        });
      }
    };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Delete = createMethodDecorator("delete");
export const Patch = createMethodDecorator("patch");
