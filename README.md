# The Eoox

Express 的扩展功能，让你的开发变得更简单。

使用装饰器语法来定义路由，无需编写路由中间件，并支持 express 的路由命中规则。

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

你需要配置你的 tsconfig.json 文件：

```json
{ "experimentalDecorators": true }
```

## 怎么使用

首先，创建你的控制器。

```ts
import { Controller, Get } from "eoox";

@Controller("test")
export class Test {
  // path -> /test
  @Get()
  get(req: express.Request, res: express.Response) {
    res.json(req.query);
  }

  // path -> /test/post/1234
  @Get("post/:id")
  param(req, res) {
    res.json(req.params);
  }
}
```

然后使用它在你的 express 应用中。

```ts
import { useController } from "eoox";

const app = express();
useController(app, "api", [Test]);
useController(app, "admin", [Test2, Test3, ...]);
// 第二个参数是你的路由前缀。
```

## 高级用法

- @Use

中间件装饰器，用于在该方法前安装一个中间件，可用于权限校验、拦截等功能。

```ts
@Controller("test")
export class Test {
  @Use(handleAuth)
  @Get("/a")
  [sfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}

const handleAuth = (req, res, next) => {
  //在这里验证你的token
  if (!token) {
    return res.json({ code: 401, message: "请登录" });
  }
  next();
};
```

- sfn

symbol 函数名，不需要再为取名而烦恼。

```ts
@Controller("test")
export class Test {
  @Get("/a")
  [sfn()](req: Request, res: Response) {
    res.json(req.query);
  }
}
```
