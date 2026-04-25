import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetDataPackagesQueryParams } from "@workspace/api-zod";
import { applyCustomPricing } from "../lib/pricing";
import { db } from "@workspace/db";
import { packageOverridesTable } from "@workspace/db/schema";

const router: IRouter = Router();

let packageCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

router.get("/packages", async (req, res): Promise<void> => {
  try {
    const isAdmin = req.query.admin === "true";

    // Use cache only for non-admin requests to ensure users get fresh but cached data
    // Admin always gets fresh data or we can still cache it but for simplicity:
    if (!isAdmin && packageCache && (Date.now() - packageCache.timestamp < CACHE_TTL)) {
      return void res.json(packageCache.data);
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
      
      if (!isAdmin) {
        packageCache = { data, timestamp: Date.now() };
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
