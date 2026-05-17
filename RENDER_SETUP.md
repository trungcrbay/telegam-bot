# Hướng dẫn deploy trên Render.com

## Build Command

```
npm install && npm run prestart
```

## Start Command

```
npm start
```

## Environment Variables

Thêm các variable sau vào Render Dashboard:

```
PUPPETEER_CACHE_DIR=/tmp/puppeteer-cache
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
NODE_ENV=production
```

## Notes

- Script `npm run prestart` sẽ tự động cài đặt Chrome
- Chrome được cache trong `/tmp/puppeteer-cache` (directory có write permission trên Render)
- Mỗi lần deploy, Chrome sẽ được kiểm tra lại
