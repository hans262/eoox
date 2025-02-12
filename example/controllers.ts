import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  sfn,
  Use,
  z,
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
  // @Query({ name: { type: "snumber" } })
  async [sfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    // console.log(this.a);
    res.json(req.query);
  }

  @Body({
    // name: z.enums(["a", "b", "c"]).defaultValue("c"),
    // name: z.object({ id: z.number().optional() }),
    // name: z.string().defaultValue("John Doe").min(4),
    name: z.string().length(2).errMsg("长度必须是2"),
    // user: z
    //   .object({
    //     id: z.number().defaultValue(1).int(),
    //     post: z.object({ id: z.number().defaultValue(222) }).optional(),
    //   })
    //   .defaultValue({ id: 2 }),
  })
  @Param({ id: z.snumber() })
  @Post("create/:id")
  [sfn()](req: Request, res: Response) {
    console.log(req.body);
    res.json({ code: 200, msg: "ok" });
  }

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
    name: z.string(),
    status: z.enums(["start", "stop"]),
    phone: z
      .string()
      .pattern(/^\d{11}$/)
      .errMsg("手机号有误"),
    tags: z
      .func((val) => Array.isArray(val) && val.length === 2)
      .errMsg("长度必须是2"),
    page: z.number().defaultValue(1),
    description: z.string().max(500),
    user: z.object({ id: z.number() }),
  })
  @Post("abc/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}
