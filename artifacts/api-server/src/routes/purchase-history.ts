import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetPurchaseHistoryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/purchase-history", async (req, res): Promise<void> => {
  const parsed = GetPurchaseHistoryQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;

  const upstream = await datamartFetch(`/purchase-history?page=${page}&limit=${limit}`);
  const data = await upstream.json();
  res.status(upstream.status).json(data);
});

export default router;
