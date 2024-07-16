import express from "express";
import { useControllers } from "../src/index.js";
import { Test, Test2 } from "./controllers.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

useControllers(app, "api", [Test]);
useControllers(app, "admin", [Test2]);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
