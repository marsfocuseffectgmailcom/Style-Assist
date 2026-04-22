import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wardrobeRouter from "./wardrobe";
import profileRouter from "./profile";
import stylistRouter from "./stylist";
import shopRouter from "./shop";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wardrobeRouter);
router.use(profileRouter);
router.use(stylistRouter);
router.use("/shop", shopRouter);

export default router;
