# The Enpd

`Express` 的扩展功能，让开发变得简单，一切为了快乐工作。

- 使用装饰器语法来定义路由，符合`express`的路由命中规则；
- 使用装饰器语法来校验参数，编写好规则将自动验证字段类型；
- 自动收集“请求处理函数”内顶层异常，无需手动捕获；
- 提供额外的功能性装饰器`@Use`。

## 安装

```sh
npm install enpd
```

## 装饰器

- `@Get | @Post | @Put | @Delete | @Patch`
- `@Body | @Query | @Param`
- `@Use`

你需要配置你的 tsconfig.json 文件：

```json
{ "experimentalDecorators": true }
```

## 怎么使用

首先，创建你的控制器。

```ts
import { Get, Post } from "enpd";

class Test {
  // GET: /test
  @Get()
  findAll(req: express.Request, res: express.Response) {
    res.json({ code: 200, msg: "ok" });
  }

  // POST: /test/create/1234
  @Post("create/:id")
  create(req, res) {}
}
```

然后使用它在你的 express 应用中。

```ts
import { use } from "enpd";

const app = express();
use.setup(app);

use("test", Test);
use("user", User);
app.listen(8080);
```

## 高级用法

- `@Body | @Query | @Param`

快速校验的你的参数，包含 `body|query|param` 中的参数。

```ts
import { e } from "enpd";

@Post("create/:id")
@Body({
  name: e.string(),
  status: e.enums("start", "stop"),
  phone: e
    .string()
    .pattern(/^\d{11}$/)
    .errMsg("手机号有误"),
  tags: e.func((val) => Array.isArray(val) && val.length === 2),
  page: e.number().defaultValue(1),
  description: e.string().max(500),
  user: e.object({ id: e.number() }),
})
@Param({ id: z.snumber() })
create(req, res) {}
```

支持的验证类型和传参方式。

```ts
// e.
// string
// number
// snumber
// array
// boolean
// sboolean
// object
// enums
// func
```

- `@Use`

中间件装饰器：方法级别的中间件，执行的顺序在该方法之前，可用于权限校验、拦截等。

另一种说法是类似于`Spring: AOP`的功能，让请求处理函数拥有面向切面编程的能力。

```ts
@Use(async (req, res, next) => {
  console.log("before");
  await next();
  console.log("after");
})
@Get()
findAll(req, res) {}
```

- `sfn`

`symbol`函数名，不再为方法取名而烦恼。

```ts
import { sfn } from "enpd";

@Post("/create/:id")
[sfn()](req, res) {}
```

- 全局异常收集

自动收集“请求处理函数”内顶层异常，无需手动捕获。可以在`express`的全局异常中间件中接收到。

```ts
@Post("create/:id")
create(req, res) {
  throw new Error("some err");
}
// global error -----------------------------
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ code: 500, msg: err.message });
  }
);
```
