import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { GetDataPackagesQueryParams } from "@workspace/api-zod";
import { applyCustomPricing } from "../lib/pricing";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  try {
    const parsed = GetDataPackagesQueryParams.safeParse(req.query);
    const network = parsed.success ? parsed.data.network : undefined;

    const url = network ? `/data-packages?network=${network}` : "/data-packages";

    const upstream = await datamartFetch(url);
    
    if (!upstream.ok) {
      const errorText = await upstream.text();
      throw new Error(`DataMart API error (${upstream.status}): ${errorText}`);
    }

    const data = await upstream.json();

    if (data.status === "success" && data.data) {
      const rawPackages = data.data as Record<string, any[]>;
      const processedData: Record<string, any[]> = {};

      for (const [net, pkgs] of Object.entries(rawPackages)) {
        // Filter out AT_PREMIUM
        if (net === "AT_PREMIUM") continue;
        
        // Apply Falaa Custom Pricing
        processedData[net] = applyCustomPricing(pkgs);
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
