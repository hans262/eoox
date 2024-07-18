import express from "express";
import { useEoox } from "../src/index.js";
import { Test, Test2 } from "./controllers.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
useEoox(app, "api", [Test]);
useEoox(app, "admin", [Test2]);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log(err);
    res.status(500).send("<p>500 Error</p>");
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("你有未处理的异常: ", reason);
});
