import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetTransactionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/balance", async (_req, res): Promise<void> => {
  const upstream = await datamartFetch("/balance");
  const data = await upstream.json();
  res.status(upstream.status).json(data);
});

router.get("/transactions", async (req, res): Promise<void> => {
  const parsed = GetTransactionsQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page ?? 1 : 1;
  const limit = parsed.success ? parsed.data.limit ?? 20 : 20;

  const upstream = await datamartFetch(`/transactions?page=${page}&limit=${limit}`);
  const data = await upstream.json();
  res.status(upstream.status).json(data);
});

export default router;
