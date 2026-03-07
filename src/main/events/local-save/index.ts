import { logger, WindowManager, Ludusavi, CloudSync } from "@main/services";
import fs from "node:fs";
import * as tar from "tar";
import { registerEvent } from "../register-event";
import path from "node:path";
import { backupsPath } from "@main/constants";
import type { GameShop, LocalSaveArtifact, Game } from "@types";
import { gamesSublevel, levelKeys } from "@main/level";
import { normalizePath, restoreLudusaviBackup } from "@main/helpers";
import crypto from "node:crypto";

export const saveLocalBackup = async (
    _event: Electron.IpcMainInvokeEvent | null,
    objectId: string,
    shop: GameShop,
    label: string
) => {
    try {
        const game = await gamesSublevel.get(levelKeys.game(shop, objectId));
        if (!game) throw new Error("Game not found");

        const backupPath = path.join(backupsPath, `${shop}-${objectId}`);

        // Remove existing backup staging area
        if (fs.existsSync(backupPath)) {
            try {
                await fs.promises.rm(backupPath, { recursive: true });
            } catch (error) {
                logger.error("Failed to remove backup path", { backupPath, error });
            }
        }

        await Ludusavi.backupGame(shop, objectId, backupPath, game?.winePrefixPath ?? null);

        const artifactId = crypto.randomUUID();
        const tarLocation = path.join(backupsPath, `${shop}-${objectId}-${artifactId}.tar`);

        await tar.create(
            {
                gzip: false,
                file: tarLocation,
                cwd: backupPath,
            },
            ["."]
        );

        // Clean up staging area after tar creation
        try {
            if (fs.existsSync(backupPath)) {
                await fs.promises.rm(backupPath, { recursive: true });
            }
        } catch (error) {
            logger.error("Failed to remove backup path after tar creation", { backupPath, error });
        }

        const stat = await fs.promises.stat(tarLocation);

        // Get homeDir from CloudSync or default
        let homeDir = "";
        if (process.platform === "linux") {
            try {
                homeDir = CloudSync.getWindowsLikeUserProfilePath(game?.winePrefixPath ?? null);
            } catch {
                homeDir = "";
            }
        }

        const artifact: LocalSaveArtifact = {
            id: artifactId,
            objectId,
            shop,
            label,
            createdAt: new Date().toISOString(),
            artifactLengthInBytes: stat.size,
            homeDir,
            winePrefixPath: game?.winePrefixPath || null,
            path: tarLocation
        };

        // We can store artifacts metadata in gamesShopCache or another sublevel.
        // For simplicity, let's just make it part of the Game object in gamesSublevel 
        // or create a new localSaveArtifacts array in it.
        const updatedGame = { ...game };
        if (!updatedGame.localSaveArtifacts) {
            updatedGame.localSaveArtifacts = [];
        }
        updatedGame.localSaveArtifacts.push(artifact);

        // Keep only last 1 backup to avoid disk space issues since we only restore the latest
        if (updatedGame.localSaveArtifacts.length > 1) {
            const removed = updatedGame.localSaveArtifacts.shift();
            if (removed && removed.path && fs.existsSync(removed.path)) {
                await fs.promises.unlink(removed.path).catch(err => logger.error("Failed to delete old backup", err));
            }
        }

        await gamesSublevel.put(levelKeys.game(shop, objectId), updatedGame as Game);

        WindowManager.mainWindow?.webContents.send(
            `on-local-backup-complete-${objectId}-${shop}`,
            true
        );

        return artifact;
    } catch (err) {
        logger.error("Failed to create local save backup", err);
        WindowManager.mainWindow?.webContents.send(
            `on-local-backup-complete-${objectId}-${shop}`,
            false
        );
        throw err;
    }
};

export const restoreLocalBackup = async (
    _event: Electron.IpcMainInvokeEvent,
    objectId: string,
    shop: GameShop,
    artifactId: string
) => {
    try {
        const game = await gamesSublevel.get(levelKeys.game(shop, objectId));
        if (!game) throw new Error("Game not found");
        const artifact = game.localSaveArtifacts?.find((a: LocalSaveArtifact) => a.id === artifactId);

        if (!artifact) {
            throw new Error(`Local save artifact ${artifactId} not found`);
        }

        const backupPath = path.join(backupsPath, `${shop}-${objectId}`);

        if (fs.existsSync(backupPath)) {
            fs.rmSync(backupPath, {
                recursive: true,
                force: true,
            });
        }

        fs.mkdirSync(backupPath, { recursive: true });

        await tar.x({
            file: artifact.path,
            cwd: backupPath,
        });

        restoreLudusaviBackup(
            backupPath,
            objectId,
            normalizePath(artifact.homeDir || ""),
            game?.winePrefixPath,
            artifact.winePrefixPath
        );

        WindowManager.mainWindow?.webContents.send(
            `on-local-backup-restore-complete-${objectId}-${shop}`,
            true
        );

        return true;
    } catch (err) {
        logger.error("Failed to restore local save backup", err);
        WindowManager.mainWindow?.webContents.send(
            `on-local-backup-restore-complete-${objectId}-${shop}`,
            false
        );
        throw err;
    }
};

export const deleteLocalBackup = async (
    _event: Electron.IpcMainInvokeEvent,
    objectId: string,
    shop: GameShop,
    artifactId: string
) => {
    try {
        const game = await gamesSublevel.get(levelKeys.game(shop, objectId));
        if (!game) throw new Error("Game not found");
        const artifactIndex = game.localSaveArtifacts?.findIndex((a: LocalSaveArtifact) => a.id === artifactId);

        if (artifactIndex !== undefined && artifactIndex >= 0) {
            const artifact = game.localSaveArtifacts![artifactIndex];
            if (artifact.path && fs.existsSync(artifact.path)) {
                await fs.promises.unlink(artifact.path).catch(err => logger.error("Failed to delete local backup file", err));
            }
            game.localSaveArtifacts!.splice(artifactIndex, 1);
            await gamesSublevel.put(levelKeys.game(shop, objectId), game as Game);
        }

        return true;
    } catch (err) {
        logger.error("Failed to delete local backup", err);
        throw err;
    }
};

registerEvent("saveLocalBackup", saveLocalBackup);
registerEvent("restoreLocalBackup", restoreLocalBackup);
registerEvent("deleteLocalBackup", deleteLocalBackup);
