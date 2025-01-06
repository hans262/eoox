import { Body, Controller, Get, Post, Query, sfn, Use } from "../src/index.js";
import type { Request, Response } from "express";

@Controller("test")
export class Test {
  a = 2;
  @Use(async (req, res, next) => {
    // throw new Error("拦截器错误");
    // return res.json({ code: 401, message: "请登录" });
    next();
  })
  @Get()
  @Query({ name: "snumber" })
  async [sfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.query);
  }

  @Post("post")
  @Body({
    name: "number[]?",
    phone: /abc/,
    arr: {
      validate: (val) => {
        // console.log(val)
        return val.length === 2;
      },
      msg: "数组长度必须是2",
    },
  })
  [sfn()](req: Request, res: Response) {
    res.json({ code: 200, msg: "ok" });
  }

  @Get("abc/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}

@Controller("test2")
export class Test2 {
  @Get("abc/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }

  @Post("abc/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}
