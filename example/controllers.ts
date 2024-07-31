import {
  Controller,
  Get,
  Off,
  Post,
  randomfn,
  Validate,
} from "../src/index.js";
import type { Request, Response } from "express";
import * as z from "zod";

// curl -X POST http://localhost:3000/admin/test2/abc/123
// curl -X GET http://localhost:3000/api/test/abc/123

@Controller("test")
export class Test {
  a = 2;
  // path -> /test
  @Off((req, res, next) => {
    // throw new Error("拦截器错误");
    // return res.json({ code: 401, message: "请登录" });
    next();
  })
  @Get()
  [randomfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    console.log(this.a);
    // next('err')
    res.json(req.query);
  }

  // path -> /test/abc
  @Get("abc")
  @Validate(
    z.object({
      name: z.string().min(1, "Name is required"),
      phone: z.coerce.number(),
      des: z.number().optional(),
    }),
    "query"
  )
  @Off((req, res, next) => {
    // throw new Error("拦截器错误");
    // return res.json({ code: 401, message: "请登录" });
    next();
  })
  [randomfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.query);
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
