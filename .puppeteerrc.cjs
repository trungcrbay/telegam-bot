const { join } = require("path");
const os = require("os");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Sử dụng cache directory - ưu tiên là project directory hoặc /tmp trên Render
  cacheDirectory:
    process.env.PUPPETEER_CACHE_DIR ||
    join(process.cwd(), ".cache", "puppeteer"),
  skipChromeDownload: false,
};
