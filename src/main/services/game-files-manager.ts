import path from "node:path";
import fs from "node:fs";
import axios from "axios";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import type { GameShop, UserPreferences } from "@types";
import { db, downloadsSublevel, gamesSublevel, levelKeys } from "@main/level";
import {
  Downloader,
  FILE_EXTENSIONS_TO_EXTRACT,
  removeSymbolsFromName,
} from "@shared";
import { SevenZip, ExtractionProgress } from "./7zip";
import { WindowManager } from "./window-manager";
import { publishExtractionCompleteNotification } from "./notifications";
import { logger } from "./logger";
import { getDirectorySize } from "@main/events/helpers/get-directory-size";
import { GameExecutables } from "./game-executables";
import createDesktopShortcut from "create-desktop-shortcuts";
import { app } from "electron";
import { SystemPath } from "./system-path";
import { ASSETS_PATH } from "@main/constants";
import { getGameAssets } from "@main/events/catalogue/get-game-assets";
import { getPathType } from "./extraction-path";

const PROGRESS_THROTTLE_MS = 1000;

export class GameFilesManager {
  private lastProgressUpdate = 0;

  constructor(
    private readonly shop: GameShop,
    private readonly objectId: string
  ) { }

  private get gameKey() {
    return levelKeys.game(this.shop, this.objectId);
  }

  private async updateExtractionProgress(progress: number, force = false) {
    const now = Date.now();

    if (!force && now - this.lastProgressUpdate < PROGRESS_THROTTLE_MS) {
      return;
    }

    this.lastProgressUpdate = now;

    const download = await downloadsSublevel.get(this.gameKey);
    if (!download) return;

    await downloadsSublevel.put(this.gameKey, {
      ...download,
      extractionProgress: progress,
    });

    WindowManager.mainWindow?.webContents.send(
      "on-extraction-progress",
      this.shop,
      this.objectId,
      progress
    );
  }

  private async setExtractionFailedState(error: unknown, targetPath?: string) {
    logger.error(
      `[GameFilesManager] Extraction failed for ${this.objectId}${targetPath ? ` at ${targetPath}` : ""}`,
      error
    );

    const download = await downloadsSublevel.get(this.gameKey);

    if (download) {
      const status =
        download.progress === 1
          ? download.shouldSeed && download.downloader === Downloader.Torrent
            ? "seeding"
            : "complete"
          : download.status;

      await downloadsSublevel.put(this.gameKey, {
        ...download,
        status,
        queued: false,
        extracting: false,
        extractionProgress: 0,
      });
    }

    WindowManager.mainWindow?.webContents.send(
      "on-extraction-failed",
      this.shop,
      this.objectId
    );
  }

  async failExtraction(error: unknown, targetPath?: string) {
    await this.setExtractionFailedState(error, targetPath);
  }

  private readonly handleProgress = (progress: ExtractionProgress) => {
    this.updateExtractionProgress(progress.percent / 100);
  };

  async extractFilesInDirectory(directoryPath: string): Promise<boolean> {
    let pathType: Awaited<ReturnType<typeof getPathType>>;
    try {
      pathType = await getPathType(directoryPath);
    } catch (error) {
      await this.setExtractionFailedState(error, directoryPath);
      return false;
    }

    if (pathType !== "directory") {
      await this.setExtractionFailedState(
        new Error(
          `Expected extraction directory but got "${pathType}" for ${directoryPath}`
        ),
        directoryPath
      );
      return false;
    }

    let files: string[];
    try {
      files = await fs.promises.readdir(directoryPath);
    } catch (error) {
      await this.setExtractionFailedState(error, directoryPath);
      return false;
    }

    const compressedFiles = files.filter((file) =>
      FILE_EXTENSIONS_TO_EXTRACT.some((ext) => file.toLowerCase().endsWith(ext))
    );

    const filesToExtract = compressedFiles.filter(
      (file) => /part1\.rar$/i.test(file) || !/part\d+\.rar$/i.test(file)
    );

    if (filesToExtract.length === 0) return true;

    await this.updateExtractionProgress(0, true);

    const totalFiles = filesToExtract.length;
    let completedFiles = 0;

    for (const file of filesToExtract) {
      try {
        const result = await SevenZip.extractFile(
          {
            filePath: path.join(directoryPath, file),
            cwd: directoryPath,
            passwords: ["online-fix.me", "steamrip.com"],
          },
          (progress) => {
            const overallProgress =
              (completedFiles + progress.percent / 100) / totalFiles;
            this.updateExtractionProgress(overallProgress);
          }
        );

        if (result.success) {
          completedFiles++;
          await this.updateExtractionProgress(
            completedFiles / totalFiles,
            true
          );
        } else {
          await this.setExtractionFailedState(
            new Error(`7zip returned unsuccessful extraction for ${file}`),
            path.join(directoryPath, file)
          );
          return false;
        }
      } catch (err) {
        await this.setExtractionFailedState(
          err,
          path.join(directoryPath, file)
        );
        return false;
      }
    }

    const archivePaths = compressedFiles
      .map((file) => path.join(directoryPath, file))
      .filter((archivePath) => fs.existsSync(archivePath));

    if (archivePaths.length > 0) {
      WindowManager.mainWindow?.webContents.send(
        "on-archive-deletion-prompt",
        archivePaths
      );
    }

    return true;
  }

  async setExtractionComplete(publishNotification = true) {
    const [download, game] = await Promise.all([
      downloadsSublevel.get(this.gameKey),
      gamesSublevel.get(this.gameKey),
    ]);

    if (!download) return;

    await downloadsSublevel.put(this.gameKey, {
      ...download,
      extracting: false,
      extractionProgress: 0,
    });

    // Calculate and store the installed size
    if (game && download.folderName) {
      const gamePath = path.join(download.downloadPath, download.folderName);
      const installedSizeInBytes = await getDirectorySize(gamePath);

      await gamesSublevel.put(this.gameKey, {
        ...game,
        installedSizeInBytes,
      });
    }

    WindowManager.mainWindow?.webContents.send(
      "on-extraction-complete",
      this.shop,
      this.objectId
    );

    if (publishNotification && game) {
      publishExtractionCompleteNotification(game);
    }

    await this.searchAndBindExecutable();
  }

  async searchAndBindExecutable(): Promise<void> {
    try {
      const [download, game] = await Promise.all([
        downloadsSublevel.get(this.gameKey),
        gamesSublevel.get(this.gameKey),
      ]);

      if (!download || !game || game.executablePath) {
        return;
      }

      const executableNames = GameExecutables.getExecutablesForGame(
        this.objectId
      );

      if (!download.folderName) {
        logger.warn(
          `[GameFilesManager] No folderName for game ${this.objectId}`
        );
        return;
      }

      const gameFolderPath = path.join(
        download.downloadPath,
        download.folderName
      );

      if (!fs.existsSync(gameFolderPath)) {
        logger.warn(
          `[GameFilesManager] Game folder does not exist: ${gameFolderPath}`
        );
        return;
      }

      let foundExePath: string | null = null;

      // Try API-based lookup first
      if (executableNames && executableNames.length > 0) {
        foundExePath = await this.findExecutableInFolder(
          gameFolderPath,
          executableNames
        );
      }

      // Always fallback to heuristic search
      if (!foundExePath) {
        logger.info(
          `[GameFilesManager] API lookup returned no results. Trying heuristic search for ${this.objectId}`
        );
        foundExePath = await this.findBestExecutableHeuristic(
          gameFolderPath,
          game.title
        );
      }

      if (foundExePath) {
        logger.info(
          `[GameFilesManager] Auto-detected executable for ${this.objectId}: ${foundExePath}`
        );

        await gamesSublevel.put(this.gameKey, {
          ...game,
          executablePath: foundExePath,
        });

        WindowManager.mainWindow?.webContents.send("on-library-batch-complete");

        await this.createDesktopShortcutForGame(game.title);
      }
    } catch (err) {
      logger.error(
        `[GameFilesManager] Error searching for executable: ${this.objectId}`,
        err
      );
    }
  }

  private isValidHttpUrl(url: string | null | undefined): url is string {
    return !!url && (url.startsWith("http://") || url.startsWith("https://"));
  }

  private isIcoUrl(url: string): boolean {
    return url.toLowerCase().endsWith(".ico");
  }

  private async downloadGameIcon(): Promise<string | null> {
    if (this.shop === "custom") {
      return null;
    }

    const iconDir = path.join(ASSETS_PATH, `${this.shop}-${this.objectId}`);
    const iconPath = path.join(iconDir, "icon.ico");

    try {
      if (fs.existsSync(iconPath)) {
        return iconPath;
      }
    } catch {
      // Ignore fs errors
    }

    const game = await gamesSublevel.get(this.gameKey);
    const assets = await getGameAssets(this.objectId, this.shop);

    const iconUrls = [
      assets?.iconUrl,
      game?.iconUrl,
      assets?.coverImageUrl,
    ].filter(this.isValidHttpUrl);

    if (iconUrls.length === 0) {
      logger.warn(
        `[GameFilesManager] No valid icon URLs found for: ${this.objectId}`
      );
      return null;
    }

    fs.mkdirSync(iconDir, { recursive: true });

    for (const iconUrl of iconUrls) {
      try {
        logger.log(
          `[GameFilesManager] Trying to download icon from: ${iconUrl}`
        );
        const response = await axios.get(iconUrl, {
          responseType: "arraybuffer",
        });
        const imageBuffer = Buffer.from(response.data);

        // If source is already ICO, use it directly
        if (this.isIcoUrl(iconUrl)) {
          fs.writeFileSync(iconPath, imageBuffer);
          logger.log(`[GameFilesManager] Copied ICO directly to: ${iconPath}`);
          return iconPath;
        }

        // Convert to square PNG (256x256 is standard for ICO), then to ICO
        const pngBuffer = await sharp(imageBuffer)
          .resize(256, 256, { fit: "cover" })
          .png()
          .toBuffer();
        const icoBuffer = await pngToIco(pngBuffer);
        fs.writeFileSync(iconPath, icoBuffer);

        logger.log(
          `[GameFilesManager] Successfully created icon at: ${iconPath}`
        );
        return iconPath;
      } catch (error) {
        logger.warn(
          `[GameFilesManager] Failed to convert icon from ${iconUrl}:`,
          error
        );
      }
    }

    logger.error(
      `[GameFilesManager] Failed to download/convert icon from any source: ${this.objectId}`
    );
    return null;
  }

  private createUrlShortcut(
    shortcutPath: string,
    url: string,
    iconPath?: string | null
  ): boolean {
    try {
      fs.mkdirSync(path.dirname(shortcutPath), { recursive: true });

      if (fs.existsSync(shortcutPath)) {
        fs.unlinkSync(shortcutPath);
      }

      let content = `[InternetShortcut]\nURL=${url}\n`;

      if (iconPath) {
        content += `IconFile=${iconPath}\nIconIndex=0\n`;
      }

      fs.writeFileSync(shortcutPath, content);
      return true;
    } catch (error) {
      logger.error(
        `[GameFilesManager] Failed to create URL shortcut: ${this.objectId}`,
        error
      );
      return false;
    }
  }

  private deleteShortcutIfExists(shortcutPath: string) {
    try {
      if (fs.existsSync(shortcutPath)) {
        fs.unlinkSync(shortcutPath);
      }
    } catch (error) {
      logger.warn(
        `[GameFilesManager] Failed to delete existing shortcut: ${shortcutPath}`,
        error
      );
    }
  }

  private createWindowsShortcut(
    shortcutName: string,
    outputPath: string,
    deepLink: string,
    iconPath?: string | null
  ): boolean {
    fs.mkdirSync(outputPath, { recursive: true });

    const linkPath = path.join(outputPath, `${shortcutName}.lnk`);
    const urlPath = path.join(outputPath, `${shortcutName}.url`);

    this.deleteShortcutIfExists(linkPath);
    this.deleteShortcutIfExists(urlPath);

    const windowVbsPath = app.isPackaged
      ? path.join(process.resourcesPath, "windows.vbs")
      : undefined;

    const nativeShortcutCreated = createDesktopShortcut({
      windows: {
        filePath: process.execPath,
        arguments: deepLink,
        name: shortcutName,
        outputPath,
        icon: iconPath ?? process.execPath,
        VBScriptPath: windowVbsPath,
      },
    });

    if (nativeShortcutCreated) {
      return true;
    }

    return this.createUrlShortcut(
      urlPath,
      deepLink,
      iconPath ?? process.execPath
    );
  }

  private async createDesktopShortcutForGame(gameTitle: string): Promise<void> {
    try {
      const shortcutName =
        removeSymbolsFromName(gameTitle).trim() || this.objectId;
      const deepLink = `hydralauncher://run?shop=${this.shop}&objectId=${this.objectId}`;
      const iconPath = await this.downloadGameIcon();

      if (process.platform === "win32") {
        const userPreferences = await db.get<string, UserPreferences | null>(
          levelKeys.userPreferences,
          { valueEncoding: "json" }
        );

        const shouldCreateDownloadShortcuts =
          userPreferences?.createStartMenuShortcut ?? true;

        if (!shouldCreateDownloadShortcuts) {
          return;
        }

        const desktopSuccess = this.createWindowsShortcut(
          shortcutName,
          SystemPath.getPath("desktop"),
          deepLink,
          iconPath
        );

        if (desktopSuccess) {
          logger.info(
            `[GameFilesManager] Created desktop shortcut for ${this.objectId}`
          );
        }

        const startMenuPath = path.join(
          SystemPath.getPath("appData"),
          "Microsoft",
          "Windows",
          "Start Menu",
          "Programs"
        );

        const startMenuSuccess = this.createWindowsShortcut(
          shortcutName,
          startMenuPath,
          deepLink,
          iconPath
        );

        if (startMenuSuccess) {
          logger.info(
            `[GameFilesManager] Created Start Menu shortcut for ${this.objectId}`
          );
        }
      } else {
        const windowVbsPath = app.isPackaged
          ? path.join(process.resourcesPath, "windows.vbs")
          : undefined;

        const options = {
          filePath: process.execPath,
          arguments: deepLink,
          name: shortcutName,
          outputPath: SystemPath.getPath("desktop"),
          icon: iconPath ?? undefined,
        };

        const desktopSuccess = createDesktopShortcut({
          windows: { ...options, VBScriptPath: windowVbsPath },
          linux: options,
          osx: options,
        });

        if (desktopSuccess) {
          logger.info(
            `[GameFilesManager] Created desktop shortcut for ${this.objectId}`
          );
        }
      }
    } catch (err) {
      logger.error(
        `[GameFilesManager] Error creating desktop shortcut: ${this.objectId}`,
        err
      );
    }
  }

  private async findExecutablesRecursive(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
      const list = await fs.promises.readdir(dir, { withFileTypes: true });

      // Folders to completely ignore during the search to avoid false positives and save time
      const ignoredFolders = ["_redist", "_commonredist", "directx", "dotnet", "extras", "installers"];

      for (const entry of list) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!ignoredFolders.includes(entry.name.toLowerCase())) {
            results = results.concat(await this.findExecutablesRecursive(fullPath));
          }
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".exe")) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore access errors
    }
    return results;
  }

  private async findExecutableInFolder(
    folderPath: string,
    executableNames: string[]
  ): Promise<string | null> {
    const normalizedNames = new Set(
      executableNames.map((name) => name.toLowerCase())
    );

    const files = await this.findExecutablesRecursive(folderPath);

    for (const file of files) {
      if (normalizedNames.has(path.basename(file).toLowerCase())) {
        return file;
      }
    }

    return null;
  }

  private async findBestExecutableHeuristic(
    folderPath: string,
    gameTitle: string
  ): Promise<string | null> {
    try {
      const exeFiles = await this.findExecutablesRecursive(folderPath);

      if (exeFiles.length === 0) return null;

      // Filter out obvious non-game executables
      const blocklist = [
        "unins",
        "uninstall",
        "setup",
        "dxsetup",
        "dxwebsetup",
        "vcredist",
        "unitycrashhandler",
        "crashreport",
        "bugreport",
        "config",
        "settings",
        "update",
        "patch",
        "language",
        "server",
        "sysinfo",
        "install",
      ];

      const candidates = exeFiles.filter((filePath) => {
        const lowerName = path.basename(filePath).toLowerCase();
        return !blocklist.some((term) => lowerName.includes(term));
      });

      if (candidates.length === 0) return null;

      let bestCandidate: { path: string; score: number } | null = null;
      const sanitizedTitle = removeSymbolsFromName(gameTitle).toLowerCase();
      const titleNoSpaces = sanitizedTitle.replace(/\s+/g, "");

      for (const fullPath of candidates) {
        let score = 0;
        const lowerName = path.basename(fullPath).toLowerCase();
        const nameWithoutExt = lowerName.replace(".exe", "");

        // Score based on name matching game title
        if (nameWithoutExt === sanitizedTitle || nameWithoutExt === titleNoSpaces) {
          score += 20; // Exact match gets a massive boost
        } else if (lowerName.includes(sanitizedTitle)) {
          score += 10;
        } else if (titleNoSpaces.length > 0 && lowerName.includes(titleNoSpaces)) {
          score += 9;
        }

        // Score based on common launcher names
        if (["launcher.exe", "start.exe", "play.exe"].includes(lowerName)) {
          score += 5;
        }

        // Penalty for being deep in subdirectories, but bonus for being in root or bin folders
        const relativePath = path.relative(folderPath, fullPath);
        const depth = relativePath.split(path.sep).length;

        if (depth === 1) {
          score += 3; // Bonus for being in the root folder
        } else {
          score -= depth; // Penalty for being too deep

          // Slight bonus if it's inside a 'bin' or 'binaries' folder which is common
          const pathParts = relativePath.toLowerCase().split(path.sep);
          if (pathParts.includes("bin") || pathParts.includes("binaries")) {
            score += 2;
          }
        }

        // Score based on file size (larger files are more likely to be the actual game, not a small launcher/config)
        try {
          const stats = await fs.promises.stat(fullPath);
          score += stats.size / (1024 * 1024); // Add size in MB to score
        } catch {
          // Ignore stat errors
        }

        if (!bestCandidate || score > bestCandidate.score) {
          bestCandidate = { path: fullPath, score };
        }
      }

      if (bestCandidate) {
        logger.info(
          `[GameFilesManager] Heuristic selected: ${bestCandidate.path} (Score: ${bestCandidate.score})`
        );
        return bestCandidate.path;
      }
    } catch (err) {
      logger.error(
        `[GameFilesManager] Heuristic search failed for ${folderPath}`,
        err
      );
    }

    return null;
  }


  async extractDownloadedFile() {
    const [download, game] = await Promise.all([
      downloadsSublevel.get(this.gameKey),
      gamesSublevel.get(this.gameKey),
    ]);

    if (!download || !game) return false;

    if (!download.folderName) {
      await this.setExtractionFailedState(
        new Error("No downloaded archive was found to extract")
      );
      return false;
    }

    const filePath = path.join(download.downloadPath, download.folderName);

    const extractionPath = path.join(
      download.downloadPath,
      path.parse(download.folderName!).name
    );

    await this.updateExtractionProgress(0, true);

    try {
      const result = await SevenZip.extractFile(
        {
          filePath,
          outputPath: extractionPath,
          passwords: ["online-fix.me", "steamrip.com"],
        },
        this.handleProgress
      );

      if (result.success) {
        const extractedNestedArchives =
          await this.extractFilesInDirectory(extractionPath);

        if (!extractedNestedArchives) {
          return false;
        }

        if (fs.existsSync(extractionPath) && fs.existsSync(filePath)) {
          WindowManager.mainWindow?.webContents.send(
            "on-archive-deletion-prompt",
            [filePath]
          );
        }

        await downloadsSublevel.put(this.gameKey, {
          ...download,
          folderName: path.parse(download.folderName!).name,
        });

        await this.setExtractionComplete();
      } else {
        await this.setExtractionFailedState(
          new Error("7zip returned unsuccessful extraction"),
          filePath
        );
        return false;
      }
    } catch (err) {
      await this.setExtractionFailedState(err, filePath);
      return false;
    }

    return true;
  }
}
