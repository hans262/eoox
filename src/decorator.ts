import { metadatas, Method } from "./metadata.js";

export function Controller(cpath: string): ClassDecorator {
  return (constructor: any) => {
    const instance = new constructor();
    metadatas.map((m) => {
      if (m.constructorName === constructor.name) {
        m.cpath = cpath;
        //添加controller实例
        m.instance = instance;
        return true;
      }
    });
  };
}

function createMethodDecorator(method: Method) {
  return (mpath: string = ""): MethodDecorator =>
    (target, propertyKey) => {
      const meta = metadatas.find((m) => {
        if (
          m.constructorName === target.constructor.name &&
          m.propertyKey === propertyKey
        ) {
          m.method = method;
          m.mpath = mpath;
          return true;
        }
      });

      if (!meta) {
        metadatas.push({
          method,
          mpath,
          propertyKey,
          constructorName: target.constructor.name,
        });
      }
    };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Delete = createMethodDecorator("delete");
