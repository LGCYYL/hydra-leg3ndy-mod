import { ipcMain, dialog, app } from "electron";
import * as tar from "tar";
import path from "node:path";
import fs from "node:fs";
import { SystemPath } from "@main/services/system-path";
import { db } from "@main/level/level";

export const registerBackupEvents = () => {
    ipcMain.handle("exportBackup", async (_, defaultPath?: string) => {
        try {
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: "Exportar Backup Completo",
                defaultPath: defaultPath || path.join(SystemPath.getPath("downloads"), `hydra-backup-${Date.now()}.tar.gz`),
                filters: [{ name: "Hydra Backup", extensions: ["tar.gz"] }],
            });

            if (canceled || !filePath) return false;

            const userDataPath = SystemPath.getPath("userData");

            // Define the critical folders to backup
            const targets = ["hydra-db", "ludusavi", "preferences.json", "hydra-db-staging"];
            const existingTargets = targets.filter(t => fs.existsSync(path.join(userDataPath, t)));

            if (existingTargets.length === 0) return false;

            await tar.c(
                {
                    gzip: true,
                    file: filePath,
                    cwd: userDataPath
                },
                existingTargets
            );

            return true;
        } catch (err) {
            console.error("Failed to export backup", err);
            return false;
        }
    });

    ipcMain.handle("importBackup", async () => {
        try {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                title: "Restaurar Backup Completo",
                filters: [{ name: "Hydra Backup", extensions: ["tar.gz"] }],
                properties: ["openFile"],
            });

            if (canceled || !filePaths || filePaths.length === 0) return false;

            const filePath = filePaths[0];
            const userDataPath = SystemPath.getPath("userData");

            // Close LevelDB to release the file lock before extraction
            await db.close();

            await tar.x({
                file: filePath,
                cwd: userDataPath
            });

            // Relaunch app to apply changes safely
            app.relaunch();
            app.quit();

            return true;
        } catch (err) {
            console.error("Failed to import backup", err);
            return false;
        }
    });

    let backupServer: import("node:net").Server | null = null;

    ipcMain.handle("hostBackup", async () => {
        const net = await import("node:net");
        const os = await import("node:os");

        try {
            const userDataPath = SystemPath.getPath("userData");
            const tempFilePath = path.join(SystemPath.getPath("temp"), `hydra-transfer-${Date.now()}.tar.gz`);

            const targets = ["hydra-db", "ludusavi", "preferences.json", "hydra-db-staging"];
            const existingTargets = targets.filter(t => fs.existsSync(path.join(userDataPath, t)));

            if (existingTargets.length === 0) return null;

            await tar.c(
                { gzip: true, file: tempFilePath, cwd: userDataPath },
                existingTargets
            );

            return new Promise((resolve) => {
                backupServer = net.createServer((socket) => {
                    const stream = fs.createReadStream(tempFilePath);
                    stream.pipe(socket);
                    stream.on("end", () => socket.end());
                });

                backupServer.listen(0, () => {
                    const port = (backupServer!.address() as import("node:net").AddressInfo).port;
                    const interfaces = os.networkInterfaces();
                    let localIp = "127.0.0.1";

                    for (const name of Object.keys(interfaces)) {
                        for (const iface of interfaces[name]!) {
                            if (iface.family === "IPv4" && !iface.internal) {
                                localIp = iface.address;
                            }
                        }
                    }
                    resolve(`${localIp}:${port}`);
                });
            });
        } catch (err) {
            console.error(err);
            return null;
        }
    });

    ipcMain.handle("stopHostBackup", async () => {
        if (backupServer) {
            backupServer.close();
            backupServer = null;
        }
    });

    ipcMain.handle("receiveBackup", async (_, hostAddress: string) => {
        const net = await import("node:net");
        return new Promise((resolve) => {
            if (!hostAddress || !hostAddress.includes(":")) return resolve(false);

            const [ip, port] = hostAddress.split(":");
            const tempFilePath = path.join(SystemPath.getPath("temp"), `hydra-received-${Date.now()}.tar.gz`);
            const fileStream = fs.createWriteStream(tempFilePath);

            const client = new net.Socket();
            client.connect(parseInt(port), ip, () => {
                client.pipe(fileStream);
            });

            client.on("close", async () => {
                try {
                    const userDataPath = SystemPath.getPath("userData");
                    await db.close();
                    await tar.x({ file: tempFilePath, cwd: userDataPath });
                    app.relaunch();
                    app.quit();
                    resolve(true);
                } catch (err) {
                    console.error("Failed to extract received backup:", err);
                    resolve(false);
                }
            });

            client.on("error", (err) => {
                console.error("TCP Client error:", err);
                resolve(false);
            });
        });
    });
};
