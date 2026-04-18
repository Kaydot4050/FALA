import { Router, type IRouter } from "express";
import healthRouter from "./health";
import packagesRouter from "./packages";
import purchaseRouter from "./purchase";
import bulkPurchaseRouter from "./bulk-purchase";
import ordersRouter from "./orders";
import purchaseHistoryRouter from "./purchase-history";
import deliveryRouter from "./delivery";
import accountRouter from "./account";
import referralRouter from "./referral";
import statsRouter from "./stats";
import withdrawalsRouter from "./withdrawals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(packagesRouter);
router.use(purchaseRouter);
router.use(bulkPurchaseRouter);
router.use(ordersRouter);
router.use(purchaseHistoryRouter);
router.use(deliveryRouter);
router.use(accountRouter);
router.use(referralRouter);
router.use(statsRouter);
router.use(withdrawalsRouter);

export default router;
