import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  sfn,
  Use,
  UseClass,
} from "../src/index.js";
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
  @Query({ name: { type: "snumber" } })
  async [sfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.query);
  }

  @Body({
    name: {
      type: (val) => {
        return val.length > 3;
      },
      optional: true,
    },
    age: { type: ["abc", "def"] }
  })
  @Param({ id: "snumber" })
  @Post("create/:id")
  [sfn()](req: Request, res: Response) {
    console.log(req.body);
    res.json({ code: 200, msg: "ok" });
  }

  @Body({ id: { type: (val, req) => true, msg: "长度必须是2" } })
  @Get("find/:id")
  [sfn()](req: Request, res: Response) {
    res.json({ code: 200, msg: "ok" });
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
