# The Eoox

`Express` 的扩展功能，让你的开发变得更简单，一切为了快乐工作。

- 使用装饰器语法来定义路由，采用`express`的路由命中规则；
- 使用装饰器语法来校验参数，编写好规则后，将自动验证字段类型；
- 自动收集`Controller`的顶层异常，无需手动捕获。
- 提供额外的功能性装饰器。

## 安装

```sh
npm install eoox
```

## 装饰器

- `@Controller`
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
import { Controller, Get, Post } from "eoox";

@Controller("test")
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
import { z } from "eoox";

@Post("create/:id")
@Body({
  name: z.string(),
  status: z.enums(["start", "stop"]),
  phone: z
    .string()
    .pattern(/^\d{11}$/)
    .errMsg("手机号有误"),
  tags: z
    .func((val) => Array.isArray(val) && val.length === 2)
    .errMsg("长度必须是2"),
  page: z.number().defaultValue(1),
  description: z.string().max(500),
  user: z.object({ id: z.number() }),
})
@Param({ id: z.snumber() })
create(req, res) {}
```

支持的验证类型和传参方式。

```ts
interface Schema {
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
  optional: boolean;
  errMsg?: string;
  defaultValue?: any;
  validate: (val: any, req?: Request) => boolean;

  min?: number;
  max?: number; // string:max-length | number:max-size
  length?: number; // string:length | array:length
  pattern?: RegExp; // string:pattern
  int?: boolean; // number:int

  fields?: { [key: string]: Schema };
  enums?: any[];
  item?: "number" | "string"; // array:item

  parent?: Schema;
}
```

- `@Use`

中间件装饰器，他的功能类似于方法级别的中间件，执行的顺序在该方法之前，可用于权限校验、拦截等。

另一种说法是类似于`Spring: AOP`的功能，让控制器处理函数拥有面向切面编程的能力。

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
import { sfn } from "eoox";

@Post("/create/:id")
[sfn()](req, res) {}
```

- 全局异常收集

自动收集`Controller`内顶层异常，无需手动捕获。你可以在`express`的异常中间件中接收到。

```ts
@Post("create/:id")
create(req, res) {
  throw new Error("some err");
}
// -----------------------------
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ code: 500, msg: err.message });
  }
);
```
