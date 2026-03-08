import path from "node:path";
import fs from "node:fs";

import { removeSymbolsFromName } from "@shared";
import { SystemPath } from "@main/services/system-path";
import { getDownloadsPath } from "../helpers/get-downloads-path";
import { logger } from "@main/services";
import { registerEvent } from "../register-event";
import { GameShop } from "@types";
import { downloadsSublevel, gamesSublevel, levelKeys } from "@main/level";

const deleteGameFolder = async (
  _event: Electron.IpcMainInvokeEvent,
  shop: GameShop,
  objectId: string
): Promise<void> => {
  const gameKey = levelKeys.game(shop, objectId);
  const download = await downloadsSublevel.get(gameKey);

  if (!download) return;

  const deleteFile = async (filePath: string, isDirectory = false) => {
    if (fs.existsSync(filePath)) {
      await new Promise<void>((resolve, reject) => {
        fs.rm(
          filePath,
          {
            recursive: isDirectory,
            force: true,
            maxRetries: 5,
            retryDelay: 200,
          },
          (error) => {
            if (error) {
              logger.error(error);
              reject();
            }
            resolve();
          }
        );
      });
    }
  };

  if (download.folderName) {
    const folderPath = path.join(
      download.downloadPath ?? (await getDownloadsPath()),
      download.folderName
    );

    const metaPath = `${folderPath}.meta`;

    await deleteFile(folderPath, true);
    await deleteFile(metaPath);
  }

  await downloadsSublevel.del(gameKey);

  // Clear installer size and executable path from game record
  const game = await gamesSublevel.get(gameKey);
  if (game) {
    await gamesSublevel.put(gameKey, {
      ...game,
      installerSizeInBytes: null,
      executablePath: null,
    });

    const shortcutName = removeSymbolsFromName(game.title).trim() || game.objectId;

    let desktopPath = SystemPath.getPath("desktop");
    let startMenuPath = process.platform === "win32"
      ? path.join(SystemPath.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs")
      : null;

    if (desktopPath) {
      await deleteFile(path.join(desktopPath, `${shortcutName}.lnk`));
      await deleteFile(path.join(desktopPath, `${shortcutName}.url`));
    }
    if (startMenuPath) {
      await deleteFile(path.join(startMenuPath, `${shortcutName}.lnk`));
      await deleteFile(path.join(startMenuPath, `${shortcutName}.url`));
    }
  }
};

registerEvent("deleteGameFolder", deleteGameFolder);
