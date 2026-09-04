import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voleiRouter from "./volei";

const router: IRouter = Router();

router.use(healthRouter);
router.use(voleiRouter);

export default router;
