import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetDataPackagesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const parsed = GetDataPackagesQueryParams.safeParse(req.query);
  const network = parsed.success ? parsed.data.network : undefined;

  const url = network ? `/data-packages?network=${network}` : "/data-packages";

  const upstream = await datamartFetch(url);
  const data = await upstream.json();

  res.status(upstream.status).json(data);
});

export default router;
