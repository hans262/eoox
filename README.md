# The Enpd

The extension function of `Express` makes development simple, and everything is for happy work.

- Use decorator syntax to define routes that comply with the `express` route hit rule;
- Use decorator syntax to validate parameters, and write rules to automatically validate field types;
- Automatically collect top-level exceptions within the 'request handling function' without the need for manual capture;
- Provide additional functional decorators `@Use`.

## Install

```sh
npm install enpd
```

## Decorator

- `@Get | @Post | @Put | @Delete | @Patch`
- `@Body | @Query | @Param`
- `@Use`

You need to configure your tsconfig.json file:

```json
{ "experimentalDecorators": true }
```

## How to use

Firstly, create your controller.

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

Then use it in your Express application.

```ts
import { use } from "enpd";

const app = express();
use.setup(app);

use("test", Test);
use("user", User);
app.listen(8080);
```

## Advanced Usage

- `@Body | @Query | @Param`

Quickly verify your parameters, including those in `body | query | param`.

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

Supported validation types and parameter passing methods.

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

Middleware decorator: a method level middleware that executes before the method and can be used for permission verification, interception, etc.

Another way of saying it is similar to the functionality of `Spring: AOP`, which gives request handling functions the ability of aspect oriented programming.

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

`Symbol` function names, no longer bothered by naming methods.

```ts
import { sfn } from "enpd";

@Post("/create/:id")
[sfn()](req, res) {}
```

- Global Exception Collection

Automatically collect top-level exceptions within the 'request handling function' without the need for manual capture. It can be received in the global exception middleware of 'express'.

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
