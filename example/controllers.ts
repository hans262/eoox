import { Controller, Get, Post } from "../src/index.js";
import type { Request, Response, NextFunction } from "express";

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function fu(){
  throw new Error("异步错误2");
}

@Controller("test")
export class Test {
  // path -> /test
  @Get()
  async get(req: Request, res: Response, next: NextFunction) {
    // next('21312')
    fu()
    // throw new Error("异步错误");
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
