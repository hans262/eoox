import { Controller, Get, Post } from "../src/index.js";
import type { Request, Response, NextFunction } from "express";

@Controller("test")
export class Test {
  // path -> /test
  @Get()
  async get(req: Request, res: Response, next: NextFunction) {
    // next('21312')
    throw new Error("异步错误");
    // console.log(req, res)
    // res.json(req.query);
  }

  // path -> /test/abc
  @Get("abc")
  get2(req: Request, res: Response) {
    res.json(req.query);
  }

  // path -> /test/abc/123
  @Get("abc/:id")
  param(req: Request, res: Response) {
    res.json(req.params);
  }
}

@Controller("test2")
export class Test2 {
  // path -> /test2/abc/123
  @Get("abc/:id")
  param(req: Request, res: Response) {
    res.json(req.params);
  }

  // path -> /test2/abc/123
  @Post("abc/:id")
  param2(req: Request, res: Response) {
    res.json(req.params);
  }
}

// curl -X POST http://localhost:3000/admin/test2/abc/123
// curl -X GET http://localhost:3000/api/test/abc/123
