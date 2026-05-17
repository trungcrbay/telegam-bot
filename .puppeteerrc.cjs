const { join } = require("path");
const os = require("os");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Sử dụng cache directory mặc định của Puppeteer
  cacheDirectory:
    process.env.PUPPETEER_CACHE_DIR ||
    join(os.homedir(), ".cache", "puppeteer"),
  skipChromeDownload: false,
};
