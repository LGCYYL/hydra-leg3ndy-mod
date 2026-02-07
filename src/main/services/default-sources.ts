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
        name: "RexaGames",
        url: "https://hydralinks.pages.dev/sources/rexagames.json",
    },
    {
        name: "FonteKazumi",
        url: "https://davidkazumi-github-io.pages.dev/fontekazumi.json",
    },
    {
        name: "GOG",
        url: "https://hydralinks.pages.dev/sources/gog.json",
    },
    {
        name: "DODI",
        url: "https://hydralinks.pages.dev/sources/dodi.json",
    },
    {
        name: "SteamRip",
        url: "https://hydralinks.pages.dev/sources/steamrip.json",
    },
    {
        name: "OnlineFix",
        url: "https://hydralinks.pages.dev/sources/onlinefix.json",
    },
    {
        name: "Xatab",
        url: "https://hydralinks.pages.dev/sources/xatab.json",
    },
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
        const existingUrls = new Set<string>();

        // Use for-await iterator which is safer across different level versions
        for await (const source of downloadSourcesSublevel.values()) {
            if (source.url) {
                existingUrls.add(source.url);
            }
        }

        logger.info(`[Leg3ndy] Found ${existingUrls.size} existing sources`);

        for (const source of DEFAULT_SOURCES) {
            if (!existingUrls.has(source.url)) {
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
                logger.info(`[Leg3ndy] Injected missing source: ${source.name}`);
            } else {
                logger.info(`[Leg3ndy] Source already exists: ${source.name}`);
            }
        }
    } catch (error) {
        logger.error("[Leg3ndy] Failed to ensure default sources", error);
    }
};
