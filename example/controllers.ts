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
    age: { type: ["abc", "def"], optional: true , defaultValue: "wqwqw"},
    // ids: { type: "number[]", optional: true },
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

  @Body({
    name: "string",
    phone: { type: /^\d{11}$/, msg: "手机号有误" },
    tags: {
      type: (val) => Array.isArray(val) && val.length === 2,
      msg: "长度必须是2",
    },
    page: { type: "number", optional: true, defaultValue: 1 },
    description: { type: "string", max: 500 },
    status: { type: ["start", "stop"], optional: true },
    power: [10, 50, 100],
  })
  @Post("abc/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}
