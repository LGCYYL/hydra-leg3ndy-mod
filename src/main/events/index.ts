import { appVersion, defaultDownloadsPath, isStaging } from "@main/constants";
import { ipcMain } from "electron";

import "./auth";
import "./autoupdater";
import "./catalogue";
import "./cloud-save";
import "./download-sources";
import "./local-save";
import "./hardware";
import "./library";
import "./leveldb";
import "./misc";
import "./notifications";
import "./profile";
import "./themes";
import "./torrenting";
import "./user";
import "./user-preferences";
import { registerBackupEvents } from "./backup";

import { GameShop } from "@types";
import { GameFilesManager } from "@main/services/game-files-manager";

import { isPortableVersion } from "@main/helpers";

registerBackupEvents();

ipcMain.handle("ping", () => "pong");
ipcMain.handle("scanForExecutable", async (_, shop: GameShop, objectId: string) => {
    return new GameFilesManager(shop, objectId).searchAndBindExecutable();
});

ipcMain.handle("checkFileExists", async (_, filePath: string) => {
    const fs = await import("node:fs");
    return fs.existsSync(filePath);
});

ipcMain.handle("getVersion", () => appVersion);
ipcMain.handle("isStaging", () => isStaging);
ipcMain.handle("isPortableVersion", () => isPortableVersion());
ipcMain.handle("getDefaultDownloadsPath", () => defaultDownloadsPath);
