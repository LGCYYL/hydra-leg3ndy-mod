import { downloadSourcesSublevel } from "@main/level";
import { DownloadSource } from "@types";
import { DownloadSourceStatus } from "@shared";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

interface DefaultSource {
    name: string;
    url: string;
}

const DEFAULT_SOURCES: DefaultSource[] = [
    {
        name: "Rutracker (Leg3ndy)",
        url: "https://raw.githubusercontent.com/KekitU/rutracker-hydra-links/main/all_categories.json",
    },
    {
        name: "FitGirl (Leg3ndy)",
        url: "https://hydralinks.pages.dev/sources/fitgirl.json",
    }
];

export const ensureDefaultSources = async () => {
    try {
        const existingSources = await downloadSourcesSublevel.values().all();

        // Check if we already have sources to avoid re-adding or duplicating if the user deleted them on purpose?
        // User asked for "Plug & Play", so if it's empty, we inject.
        if (existingSources.length === 0) {
            logger.info("[Leg3ndy] No download sources found. Injecting defaults...");

            for (const source of DEFAULT_SOURCES) {
                const id = uuidv4();
                const newSource: DownloadSource = {
                    id,
                    name: source.name,
                    url: source.url,
                    status: DownloadSourceStatus.PendingMatching,
                    downloadCount: 0,
                    createdAt: new Date().toISOString(),
                };

                await downloadSourcesSublevel.put(id, newSource);
                logger.info(`[Leg3ndy] Injected source: ${source.name}`);
            }
        } else {
            // Optional: Check if specific leg3ndy sources exist and add them if missing? 
            // For now, let's just do it if the list is empty to be safe and simple.
            // Actually, the user might have deleted them. Let's stick to "if empty".
            logger.info(`[Leg3ndy] Download sources already exist. Skipping injection.`);
        }
    } catch (error) {
        logger.error("[Leg3ndy] Failed to ensure default sources", error);
    }
};
