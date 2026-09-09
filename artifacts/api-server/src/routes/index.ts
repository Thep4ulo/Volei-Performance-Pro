import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voleiRouter from "./volei";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireAuth, voleiRouter);

export default router;
