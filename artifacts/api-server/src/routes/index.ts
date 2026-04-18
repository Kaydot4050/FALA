import { Router, type IRouter } from "express";
import healthRouter from "./health";
import packagesRouter from "./packages";
import purchaseRouter from "./purchase";
import ordersRouter from "./orders";
import deliveryRouter from "./delivery";
import accountRouter from "./account";

const router: IRouter = Router();

router.use(healthRouter);
router.use(packagesRouter);
router.use(purchaseRouter);
router.use(ordersRouter);
router.use(deliveryRouter);
router.use(accountRouter);

export default router;
