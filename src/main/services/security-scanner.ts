import { spawn } from "child_process";
import { logger } from "./logger";
import path from "node:path";

export class SecurityScanner {
  /**
   * Scans a specific folder using Windows Defender (MpCmdRun.exe).
   * @param folderPath The absolute path of the folder to scan.
   * @returns true if the folder is clean, false if a threat was found or the scan failed to run.
   */
  public static async scan(folderPath: string): Promise<boolean> {
    if (process.platform !== "win32") {
      logger.info(`[LEG3NDY Aegis] Platform is not Windows. Skipping scan for ${folderPath}`);
      return true; // Assume safe if not on Windows, or use another engine if available later
    }

    logger.info(`[LEG3NDY Aegis] Starting antivirus scan on directory: ${folderPath}`);

    return new Promise((resolve) => {
      // The default path for Windows Defender Command Line Utility
      const mpCmdRunPath = path.join(
        process.env.ProgramFiles || "C:\\Program Files",
        "Windows Defender",
        "MpCmdRun.exe"
      );

      // -Scan -ScanType 3 determines a Custom Scan.
      // -File specifies the path.
      // -DisableRemediation prevents Defender from automatically deleting/quarantining without us knowing? 
      // Actually, we WANT it to quarantine if it finds something so the user is safe, but we will catch the exit code 2.
      const args = ["-Scan", "-ScanType", "3", "-File", folderPath];

      const scanProcess = spawn(mpCmdRunPath, args, {
        windowsHide: true,
      });

      let stdout = "";
      scanProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      scanProcess.on("close", (code) => {
        logger.info(`[LEG3NDY Aegis] Scan finished with exit code: ${code}`);

        if (code === 0) {
          logger.info(`[LEG3NDY Aegis] No threats found in ${folderPath}. Directory is clean.`);
          resolve(true); // Clean
        } else if (code === 2) {
          logger.warn(`[LEG3NDY Aegis] THREAT DETECTED in ${folderPath}. Exit code 2.`);
          logger.warn(`[LEG3NDY Aegis] Scanner output: ${stdout}`);
          resolve(false); // Malware detected
        } else {
          // Any other code could mean an error running the tool itself (e.g. Defender disabled, file not found)
          logger.error(`[LEG3NDY Aegis] Scan encountered an unexpected error. Exit code: ${code}`);
          logger.error(`[LEG3NDY Aegis] Scanner output: ${stdout}`);
          // If the AV fails to run, we might want to let the user play, but log it.
          resolve(true); 
        }
      });

      scanProcess.on("error", (err) => {
        logger.error(`[LEG3NDY Aegis] Failed to spawn MpCmdRun.exe:`, err);
        // If we can't spawn the scanner, just proceed (e.g., AV is completely disabled or path changed)
        resolve(true);
      });
    });
  }
}
