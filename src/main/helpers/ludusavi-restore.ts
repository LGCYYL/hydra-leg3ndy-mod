import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { logger, CloudSync } from "@main/services";
import { publicProfilePath } from "@main/constants";
import type { LudusaviBackupMapping } from "@types";

export const addTrailingSlash = (pathKey: string) => {
    if (!pathKey.endsWith("\\") && !pathKey.endsWith("/")) {
        return `${pathKey}\\`;
    }

    return pathKey;
};

export const transformLudusaviBackupPathIntoWindowsPath = (
    backupPath: string,
    winePrefixPath?: string | null
) => {
    return backupPath
        .replace(winePrefixPath ? addTrailingSlash(winePrefixPath) : "", "")
        .replace("drive_c", "C:");
};

export const addWinePrefixToWindowsPath = (
    windowsPath: string,
    winePrefixPath?: string | null
) => {
    if (!winePrefixPath) {
        return windowsPath;
    }

    return path.join(winePrefixPath, windowsPath.replace("C:", "drive_c"));
};

export const restoreLudusaviBackup = (
    backupPath: string,
    title: string,
    homeDir: string,
    winePrefixPath?: string | null,
    artifactWinePrefixPath?: string | null
) => {
    const gameBackupPath = path.join(backupPath, title);
    const mappingYamlPath = path.join(gameBackupPath, "mapping.yaml");

    const data = fs.readFileSync(mappingYamlPath, "utf8");
    const manifest = YAML.parse(data) as {
        backups: LudusaviBackupMapping[];
        drives: Record<string, string>;
    };

    const userProfilePath =
        CloudSync.getWindowsLikeUserProfilePath(winePrefixPath);

    manifest.backups.forEach((backup) => {
        Object.keys(backup.files).forEach((key) => {
            const sourcePathWithDrives = Object.entries(manifest.drives).reduce(
                (prev, [driveKey, driveValue]) => {
                    return prev.replace(driveValue, driveKey);
                },
                key
            );

            const sourcePath = path.join(gameBackupPath, sourcePathWithDrives);

            logger.info(`Source path: ${sourcePath}`);

            const destinationPath = transformLudusaviBackupPathIntoWindowsPath(
                key,
                artifactWinePrefixPath
            )
                .replace(
                    homeDir,
                    addWinePrefixToWindowsPath(userProfilePath, winePrefixPath)
                )
                .replace(
                    publicProfilePath,
                    addWinePrefixToWindowsPath(publicProfilePath, winePrefixPath)
                );

            logger.info(`Moving ${sourcePath} to ${destinationPath}`);

            fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

            if (fs.existsSync(destinationPath)) {
                fs.unlinkSync(destinationPath);
            }

            fs.renameSync(sourcePath, destinationPath);
        });
    });
};
