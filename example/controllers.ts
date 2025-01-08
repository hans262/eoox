import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  sfn,
  Use,
} from "../src/index.js";
import type { Request, Response } from "express";

// let opt: any = function (val: any) {
//   return true;
// };
// opt = (val: any) => true;
// opt = /abc/;
// opt = { type: "dwq" };
// console.log(typeof opt);

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

  @Post("create/:id")
  @Body({
    name: "string",
    // tags: {
    //   type: function ( val, req)  {
    //     // console.log(this.a);
    //     return Array.isArray(val) && val.length === 2;
    //   },
    //   msg:'长度必须是2'
    // },
    tag2: function (val, req) {
      console.log(req);
      return Array.isArray(val) && val.length === 2;
    },
  })
  @Param({ id: "snumber" })
  [sfn()](req: Request, res: Response) {
    res.json({ code: 200, msg: "ok" });
  }

  // @Body({ id: { type: (val, req) => true, msg: "长度必须是2" } })
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
