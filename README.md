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

## How to use

First, create your controller.

```ts
import { Controller, Get } from "eoox";

@Controller("test")
export class Test {
  // path -> /test/abc
  @Get("abc")
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
import { useControllers } from "eoox";
const app = express();
useControllers(app, "/api", [Test]);
// The second parameter represents your routing prefix.
```
