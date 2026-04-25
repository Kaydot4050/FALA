import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetDataPackagesQueryParams } from "@workspace/api-zod";
import { applyCustomPricing } from "../lib/pricing";
import { db } from "@workspace/db";
import { packageOverridesTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  try {
    if (!process.env["DATAMART_API_KEY"]) {
      throw new Error("Configuration Error: DATAMART_API_KEY is missing in environment variables.");
    }
    const parsed = GetDataPackagesQueryParams.safeParse(req.query);
    const network = parsed.success ? parsed.data.network : undefined;
    const isAdmin = req.query.admin === "true";

    const url = network ? `/data-packages?network=${network}` : "/data-packages";

    const upstream = await datamartFetch(url);
    
    if (!upstream.ok) {
      const errorText = await upstream.text();
      throw new Error(`DataMart API error (${upstream.status}): ${errorText}`);
    }

    const data = await upstream.json() as any;

    if (data.status === "success" && data.data) {
      const rawPackages = data.data as Record<string, any[]>;
      const processedData: Record<string, any[]> = {};

      // Fetch all overrides from DB
      const overrides = await db.select().from(packageOverridesTable);
      const overrideMap = new Map(overrides.map(o => [o.id, o]));

      for (const [net, pkgs] of Object.entries(rawPackages)) {
        if (net === "AT_PREMIUM") continue;
        
        const pricedPkgs = applyCustomPricing(pkgs);
        
        // Merge DB Overrides
        processedData[net] = pricedPkgs.map(p => {
          const key = `${p.network}_${p.capacity}${p.mb ? 'MB' : 'GB'}`;
          const over = overrideMap.get(key);
          if (over) {
            return {
              ...p,
              price: over.customPrice || p.price,
              oldPrice: over.customOldPrice || p.oldPrice,
              showOldPrice: over.showOldPrice,
              inStock: over.inStock,
              isHidden: over.isHidden
            };
          }
          return p;
        }).filter(p => isAdmin || !p.isHidden);
      }

      data.data = processedData;
    }

    res.status(upstream.status).json(data);
  } catch (error) {
    console.error("Bundle fetch failed:", error);
    res.status(504).json({
      status: "error",
      message: "Gateway Timeout: The vendor API took too long to respond.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
