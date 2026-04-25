import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetDataPackagesQueryParams } from "@workspace/api-zod";
import { applyCustomPricing } from "../lib/pricing";
import { db } from "@workspace/db";
import { packageOverridesTable } from "@workspace/db/schema";

const router: IRouter = Router();

const packageCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

router.get("/packages", async (req, res): Promise<void> => {
  try {
    const isAdmin = req.query.admin === "true";
    const cacheKey = JSON.stringify(req.query);

    // Use cache only for non-admin requests
    if (!isAdmin) {
      const cached = packageCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return void res.json(cached.data);
      }
    }

    const parsed = GetDataPackagesQueryParams.safeParse(req.query);
    const network = parsed.success ? parsed.data.network : undefined;
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

      const overrides = await db.select().from(packageOverridesTable);
      const overrideMap = new Map(overrides.map(o => [o.id, o]));

      for (const [net, pkgs] of Object.entries(rawPackages)) {
        const pricedPkgs = applyCustomPricing(pkgs);
        
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
      
      if (!isAdmin) {
        packageCache.set(cacheKey, { data, timestamp: Date.now() });
      }
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
