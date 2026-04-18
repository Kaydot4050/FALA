import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

router.get("/order/:reference", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.reference)
    ? req.params.reference[0]
    : req.params.reference;

  if (!raw) {
    res.status(400).json({ error: "Missing order reference" });
    return;
  }

  const upstream = await datamartFetch(`/order-status/${encodeURIComponent(raw)}`);
  const data = await upstream.json();
  res.status(upstream.status).json(data);
});

export default router;
