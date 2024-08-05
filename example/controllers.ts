import {
  Before,
  Body,
  Controller,
  Get,
  Post,
  Query,
  randomfn,
} from "../src/index.js";
import type { Request, Response } from "express";

@Controller("test")
export class Test {
  a = 2;
  // path -> /test
  @Before(async (req, res, next) => {
    // throw new Error("拦截器错误");
    // return res.json({ code: 401, message: "请登录" });
    next();
  })
  @Get()
  @Query({ name: "snumber" })
  async [randomfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.query);
  }

  // path -> /test/abc
  @Post("post")
  @Body({
    // name: 'string?',
    phone: "snumber?",
  })
  [randomfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.body);
  }

  // path -> /test/abc/123
  @Get("abc/:id")
  [randomfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}

@Controller("test2")
export class Test2 {
  // path -> /test2/abc/123
  @Get("abc/:id")
  [randomfn()](req: Request, res: Response) {
    res.json(req.params);
  }

  // path -> /test2/abc/123
  @Post("abc/:id")
  [randomfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}
