import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookmarkletRouter from "./bookmarklet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookmarkletRouter);

export default router;
