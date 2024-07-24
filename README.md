# The Eoox

The extension function of express makes your development easier.

Use decorator syntax to define your route, without the need to define route connections, and support Express's route parsing method.

## Install

```sh
npm install eoox
```

## Decorator

- @Controller
- @Get
- @Post
- @Put
- @Delete
- @Patch
- @Off

You need to configure in tsconfig.json:

```json
{ "experimentalDecorators": true }
```

## How to use

First, create your controller.

```ts
import { Controller, Get } from "eoox";

@Controller("test")
export class Test {
  // path -> /test
  @Get()
  get(req, res) {
    res.json(req.query);
  }

  // path -> /test/abc/123
  @Get("abc/:id")
  param(req, res) {
    res.json(req.params);
  }
}
```

Then use it in your express application.

```ts
import { useController } from "eoox";
const app = express();
useController(app, "/api", [Test]);
useController(app, "/admin", [Test2, Test3, ...]);
// The second parameter represents your routing prefix.
```

## Advanced

- @Off

拦截装饰器，用于校验当前路由的前置函数。

```ts
@Controller("test")
export class Test {
  @Off((req, res, next) => {
    //在这里验证你的token
    if (!token) {
      return res.json({ code: 401, message: "请登录" });
    }
    next();
  })
  @Get("/a")
  [randomfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}
```

- randomfn

你可以使用随机的函数名，你不需要再为取名而烦恼，因为方法函数名不重要。

```ts
@Controller("test")
export class Test {
  @Get("/a")
  [randomfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}
```
