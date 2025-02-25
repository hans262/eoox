import { Body, Get, Param, Post, sfn, Use, e } from "../src/index.js";
import type { Request, Response } from "express";

export class Test {
  a = 2;

  @Use(async function (req, res, next) {
    // throw new Error("拦截器错误");
    // console.log(this)
    // return res.json({ code: 401, message: "请登录" });
    next();
  })
  @Get()
  // @Query({ name: { type: "snumber" } })
  async [sfn()](req: Request, res: Response) {
    // throw new Error("控制器错误");
    console.log(this.a);
    res.json(req.query);
  }

  @Body({
    // name: e.enums(["a", "b", "c"]).defaultValue("c"),
    // name: e.object({ id: e.number().optional() }),
    // name: e.string().defaultValue("John Doe").min(4),
    name: e.number(),
    // audio: e.object({
    //   tts: e.object({
    //     text: e.array().item("string").length(2),
    //     speed: e.number().min(0.5).max(2),
    //     audio_man: e.string(),
    //   }),
    //   wav_url: e.string(),
    //   type: e.enums(["tts", "audio"]),
    //   volume: e.number().min(0).max(100),
    //   language: e.enums(["cn"]),
    // }),
    // user: e.object({ id: e.number() }),
    // user: e
    //   .object({
    //     id: e.number().defaultValue(1).int(),
    //     post: e.object({ id: e.number().defaultValue(222) }).optional(),
    //   })
    //   .defaultValue({ id: 2 }),
  })
  @Param({ id: e.snumber() })
  @Post("create/:id")
  [sfn()](req: Request, res: Response) {
    console.log(req.body, req.params);
    res.json({ code: 200, msg: "ok" });
  }

  @Get("find/:id")
  [sfn()](req: Request, res: Response) {
    res.json({ code: 200, msg: "ok" });
  }
}

export class User {
  @Get("info/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }

  @Body({
    name: e.string(),
    status: e.enums(["start", "stop"]),
    phone: e
      .string()
      .pattern(/^\d{11}$/)
      .errMsg("手机号有误"),
    tags: e.func((val) => Array.isArray(val) && val.length === 2),
    page: e.number().defaultValue(1),
    description: e.string().max(500),
    user: e.object({ id: e.number() }),
  })
  @Post("update/:id")
  [sfn()](req: Request, res: Response) {
    res.json(req.params);
  }
}
