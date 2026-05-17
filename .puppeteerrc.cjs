const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Tải Chrome từ cache của Puppeteer
  cacheDirectory: join(__dirname, ".puppeteer-cache"),
  skipChromeDownload: false,
};
