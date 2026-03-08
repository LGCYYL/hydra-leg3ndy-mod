import { HydraApi, logger } from "@main/services";
import { catalogueCacheSublevel } from "@main/level";
import crypto from "node:crypto";
import { registerEvent } from "../register-event";

export const searchCatalogue = async (
    _event: Electron.IpcMainInvokeEvent,
    data: any
) => {
    // Create a deterministic hash of the request parameters to use as cache key
    const cacheKey = crypto
        .createHash("sha256")
        .update(JSON.stringify(data || {}))
        .digest("hex");

    try {
        const response = await HydraApi.post("/catalogue/search", data, {
            needsAuth: false,
        });

        // Save successful response to cache
        await catalogueCacheSublevel.put(cacheKey, response);

        return response;
    } catch (error) {
        logger.warn("Catalogue API failed, attempting to use local cache", error);

        try {
            const cached = await catalogueCacheSublevel.get(cacheKey);
            if (cached) {
                logger.info("Serving catalogue from local cache");
                return { ...cached, isCachedResult: true };
            }
        } catch (cacheError) {
            logger.error("No cache available for this query", cacheError);
        }

        throw error;
    }
};

registerEvent("searchCatalogue", searchCatalogue);
