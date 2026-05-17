#!/bin/bash
set -e

echo "📥 Cài đặt Chrome cho Puppeteer..."
npx puppeteer browsers install chrome || true

echo "✅ Chrome đã sẵn sàng!"
echo "🚀 Khởi động bot..."
node index.js
