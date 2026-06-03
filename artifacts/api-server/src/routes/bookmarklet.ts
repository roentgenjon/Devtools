import { Router, type IRouter } from "express";
import { bookmarkletCode } from "../generated/bookmarklet-content";

const router: IRouter = Router();

router.get("/bookmarklet.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(bookmarkletCode);
});

export default router;
