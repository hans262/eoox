import { Controller, Get, Off, Post, randomfn } from "../src/index.js";
import type { Request, Response } from "express";

@Controller("test")
export class Test {
  // path -> /test
  @Off((req, res, next) => {
    // throw new Error("拦截器错误");
    // res.json({ code: 401, message: "请登录" });
    next();
  })
  @Get()
  [randomfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    res.json(req.query);
  }

  // path -> /test/abc
  @Get("abc")
  [randomfn()](req: Request, res: Response) {
    res.json("1221");
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

// curl -X POST http://localhost:3000/admin/test2/abc/123
// curl -X GET http://localhost:3000/api/test/abc/123
