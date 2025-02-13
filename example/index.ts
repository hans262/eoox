import express from "express";
import { useController } from "../src/index.js";
import { Test, Test2 } from "./controllers.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
useController(app, "api", [Test]);
useController(app, "admin", [Test2]);

app.use(express.static("/Users/macbookair/Desktop/develop/enpd"));

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // console.error(err);
    console.error(err);
    res.status(500).json({ code: 500, msg: err.message });
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("未处理的异常: ", err);
});
