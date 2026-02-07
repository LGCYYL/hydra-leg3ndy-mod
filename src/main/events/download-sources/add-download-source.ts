import { registerEvent } from "../register-event";
import { HydraApi } from "@main/services/hydra-api";
import { downloadSourcesSublevel } from "@main/level";
import type { DownloadSource } from "@types";
import { networkLogger as logger } from "@main/services";
import { DownloadSourceStatus } from "@shared";
import axios from "axios";
import crypto from "crypto";

const addDownloadSource = async (
  _event: Electron.IpcMainInvokeEvent,
  url: string
) => {
  try {
    const existingSources = await downloadSourcesSublevel.values().all();
    const urlExists = existingSources.some((source) => source.url === url);

    if (urlExists) {
      throw new Error("Download source with this URL already exists");
    }

    let downloadSource: DownloadSource;

    try {
      downloadSource = await HydraApi.post<DownloadSource>(
        "/download-sources",
        {
          url,
        },
        { needsAuth: false }
      );
    } catch (error) {
      // Fallback: If API rejects the URL (e.g. 400 Bad Request), try to fetch it directly
      // and validate it locally. This allows adding sources that the API might not strictly approve yet.
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        logger.warn("API rejected download source, attempting local validation:", url);
        
        try {
          const response = await axios.get(url);
          const data = response.data;

          // Basic validation of the JSON structure
          if (!data.name || !Array.isArray(data.downloads)) {
             throw new Error("Invalid download source JSON structure");
          }

          downloadSource = {
            id: crypto.randomUUID(),
            name: data.name,
            url: url,
            status: DownloadSourceStatus.PendingMatching, // Default to pending matching
            downloadCount: 0,
            createdAt: new Date().toISOString(),
          };
          
          logger.info("Successfully validated download source locally:", downloadSource.name);
        } catch (localError) {
          logger.error("Local validation failed:", localError);
          throw error; // Throw the original API error if local validation also fails
        }
      } else {
        throw error;
      }
    }

    if (HydraApi.isLoggedIn() && HydraApi.hasActiveSubscription()) {
      try {
        await HydraApi.post("/profile/download-sources", {
          urls: [url],
        });
      } catch (error) {
        logger.error("Failed to add download source to profile:", error);
      }
    }

    await downloadSourcesSublevel.put(downloadSource.id, {
      ...downloadSource,
      isRemote: true,
      createdAt: new Date().toISOString(),
    });

    return downloadSource;
  } catch (error) {
    logger.error("Failed to add download source:", error);
    throw error;
  }
};

registerEvent("addDownloadSource", addDownloadSource);
