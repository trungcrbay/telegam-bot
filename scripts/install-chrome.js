#!/usr/bin/env node
/**
 * Script để cài đặt Chrome cho Puppeteer trước khi khởi động bot
 */

const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function installChrome() {
  console.log("🔍 Kiểm tra Chrome...");

  // Xác định cache directory
  const cacheDir =
    process.env.PUPPETEER_CACHE_DIR ||
    path.join(os.homedir(), ".cache", "puppeteer");

  console.log(`📁 Cache directory: ${cacheDir}`);

  // Tạo thư mục nếu chưa tồn tại
  if (!fs.existsSync(cacheDir)) {
    console.log(`📦 Tạo thư mục cache...`);
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  try {
    // Cố gắng sử dụng Puppeteer có sẵn
    const executablePath = await puppeteer.executablePath();
    if (executablePath && fs.existsSync(executablePath)) {
      console.log(`✅ Chrome đã có: ${executablePath}`);
      return true;
    }
  } catch (e) {
    console.log(`⚠️  Puppeteer-core không có Chrome, sẽ download...`);
  }

  // Download Chrome qua Puppeteer
  try {
    console.log(`⏳ Đang download Chrome... (có thể mất vài phút)`);
    const browserFetcher = puppeteer.createBrowserFetcher({
      cachePath: cacheDir,
    });

    // Get revision (thường là version mới nhất)
    const revision = require("puppeteer/package.json").puppeteer
      .chromium_revision;

    const info = await browserFetcher.download(revision);
    console.log(`✅ Chrome đã download: ${info.executablePath}`);

    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi download Chrome: ${error.message}`);
    process.exit(1);
  }
}

// Chạy script
installChrome().catch((error) => {
  console.error("❌ Lỗi:", error);
  process.exit(1);
});
