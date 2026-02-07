const { default: axios } = require("axios");
const tar = require("tar");
const util = require("node:util");
const fs = require("node:fs");
const path = require("node:path");

const exec = util.promisify(require("node:child_process").exec);

const ludusaviVersion = "0.29.0";

const fileName = {
  win32: `ludusavi-v${ludusaviVersion}-win64.zip`,
  linux: `ludusavi-v${ludusaviVersion}-linux.tar.gz`,
  darwin: `ludusavi-v${ludusaviVersion}-mac.tar.gz`,
};

const ludusaviBinaryName = {
  win32: "ludusavi.exe",
  linux: "ludusavi",
  darwin: "ludusavi",
};

const downloadLudusavi = async () => {
  const binaryPath = path.join(process.cwd(), "ludusavi", ludusaviBinaryName[process.platform]);

  if (fs.existsSync(binaryPath)) {
    console.log("Ludusavi binary found.");
    return;
  }

  console.error("SECURITY ALERT: Ludusavi binary not found!");
  console.error("Please manually download the correct version (v" + ludusaviVersion + ") and place it at:");
  console.error(binaryPath);
  console.error("Automatic download disabled for security.");
  // process.exit(1); // Optional: fail build if missing
};

downloadLudusavi();
