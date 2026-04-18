import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const upstream = await datamartFetch("/stats");
  const data = await upstream.json();
  res.status(upstream.status).json(data);
});

export default router;
