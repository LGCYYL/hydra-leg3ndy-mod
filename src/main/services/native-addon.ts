import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { app } from "electron";
import type { ProcessPayload } from "./download/types";

import { logger } from "./logger";

type NativeProcessProfileImageResponse = {
  imagePath?: string;
  image_path?: string;
  mimeType?: string;
  mime_type?: string;
};

type HydraNativeModule = {
  processProfileImage: (
    imagePath: string,
    targetExtension?: string
  ) => NativeProcessProfileImageResponse;
  listProcesses: () => ProcessPayload[];
};

export class NativeAddon {
  private static nativeModule: HydraNativeModule | null = null;
  private static notFound = false;

  private static resolveAddonPath() {
    if (app.isPackaged) {
      return path.join(
        process.resourcesPath,
        "hydra-native",
        "hydra-native.node"
      );
    }

    return path.join(app.getAppPath(), "hydra-native", "hydra-native.node");
  }

  private static load() {
    if (this.nativeModule) return this.nativeModule;

    if (this.notFound) {
      throw new Error("Hydra native addon unavailable (build Rust addon with: npm run build:native)");
    }

    const addonPath = this.resolveAddonPath();
    const addonDir = path.dirname(addonPath);

    if (!fs.existsSync(addonPath)) {
      this.notFound = true;
      logger.warn(
        `[NativeAddon] Hydra native addon not found at ${addonPath}. ` +
        `Process tracking and profile images will be unavailable. ` +
        `Run 'npm run build:native' after installing Rust to enable.`
      );
      throw new Error(`Hydra native addon not found at ${addonPath}`);
    }

    if (process.platform === "linux") {
      process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
        ? `${addonDir}:${process.env.LD_LIBRARY_PATH}`
        : addonDir;
    }

    const require = createRequire(import.meta.url);
    const nativeModule = require(addonPath) as HydraNativeModule;

    this.nativeModule = nativeModule;

    return nativeModule;
  }

  public static processProfileImage(
    imagePath: string,
    targetExtension = "webp"
  ) {
    try {
      const response = this.load().processProfileImage(
        imagePath,
        targetExtension
      );

      const normalizedImagePath = response.imagePath ?? response.image_path;
      const normalizedMimeType = response.mimeType ?? response.mime_type;

      if (!normalizedImagePath || !normalizedMimeType) {
        throw new Error("Hydra native addon returned an invalid payload");
      }

      return {
        imagePath: normalizedImagePath,
        mimeType: normalizedMimeType,
      };
    } catch (error) {
      logger.error("Failed to process profile image via native addon", error);
      throw error;
    }
  }

  public static listProcesses(): ProcessPayload[] {
    try {
      const response = this.load().listProcesses();

      if (!Array.isArray(response)) {
        throw new Error("Hydra native addon returned an invalid process list");
      }

      return response.filter((process): process is ProcessPayload => {
        return (
          typeof process?.pid === "number" &&
          typeof process?.name === "string" &&
          process.name.length > 0
        );
      });
    } catch (error) {
      logger.error("Failed to list processes via native addon", error);
      return [];
    }
  }
}
