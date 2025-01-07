# The Eoox

Express 的扩展功能，让你的开发变得更简单。

使用装饰器语法来定义路由，无需编写路由中间件，并支持 express 的路由命中规则。

还包含了简单的参数校验功能，总之一切为了开发便利。

## 安装

```sh
npm install eoox
```

## 装饰器

- @Controller
- @Get
- @Post
- @Put
- @Delete
- @Patch
- @Use
- @Body | @Query | @Param

你需要配置你的 tsconfig.json 文件：

```json
{ "experimentalDecorators": true }
```

## 怎么使用

首先，创建你的控制器。

```ts
import { Controller, Get, Post } from "eoox";

@Controller("test")
export class Test {
  // GET: /test
  @Get()
  findAll(req: express.Request, res: express.Response) {
    res.json({ code: 200, msg: "ok" });
  }

  // POST: /test/create/1234
  @Post("create/:id")
  create(req, res) {
    res.json({ code: 200, msg: "ok" });
  }
}
```

然后使用它在你的 express 应用中。

```ts
import { useController } from "eoox";

const app = express();
useController(app, "api", [Test]);
useController(app, "admin", [Other, Other2, ...]);
// 第二个参数是你的路由前缀。
```

## 高级用法

- `@Body | @Query | @Param`

快速校验的你的参数，包含 `body|query|param` 中的参数。

```ts
@Controller("test")
export class Test {
  @Post("create")
  @Body({
    name: "string",
    phone: /^\d{11}$/,
    arr: {
      validate: (val) => {
        return Array.isArray(val) && val.length === 2;
      },
      msg: "数组长度必须是2",
    },
  })
  create(req, res) {
    res.json({ code: 200, msg: "ok" });
  }
}
```

支持的校验类型，和传参方式，`?`代表可选。

```ts
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

type Rule =
  | Schema
  | {
      type?: Schema;
      msg?: string;
      validate?: (val: any, req?: Request) => boolean;
    };
```

- `@Use`

中间件装饰器，用于在该方法前安装一个中间件，可用于权限校验、拦截等功能。

让控制器处理函数拥有`AOP`切面编程的能力。

```ts
@Controller("test")
export class Test {
  @Use(async (req, res, next) => {
    console.log("before");
    await next();
    console.log("after");
  })
  @Get("/a")
  [sfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}
```

- `sfn`

`symbol`函数名，不再为方法取名而烦恼。

```ts
@Controller("test")
export class Test {
  @Get("/a")
  [sfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}
```
