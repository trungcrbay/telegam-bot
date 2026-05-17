# 🤖 Auto Video Bot

Telegram bot tự động tạo video từ 1 câu lệnh duy nhất. Chỉ cần nhập chủ đề, bot tự động:

1. 📝 **Viết kịch bản** — Dùng Gemini AI sinh nội dung 5 slide
2. 🎨 **Tạo slide ảnh** — Render slide đẹp với màu gradient ngẫu nhiên
3. 🎙️ **Tạo giọng đọc** — Google TTS chuyển văn bản thành audio tiếng Việt
4. 🎬 **Ghép video** — ffmpeg kết hợp ảnh + audio thành video MP4
5. 📤 **Gửi video** — Tự động gửi video hoàn chỉnh về Telegram

---

## 📋 Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) >= 18
- [ffmpeg](https://ffmpeg.org/download.html) đã cài và có trong PATH
- Kết nối internet

---

## ⚙️ Cài đặt

### 1. Clone / tải project

```bash
git clone <repo-url>
cd telegram-bot
```

### 2. Cài dependencies

```bash
npm install
```

> ⚠️ Lần đầu cài sẽ tải Chromium (~170MB) cho Puppeteer, mất vài phút.

### 3. Cấu hình `.env`

Tạo file `.env` (hoặc sửa file có sẵn):

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
```

| Biến | Cách lấy |
|------|----------|
| `TELEGRAM_BOT_TOKEN` | Chat với [@BotFather](https://t.me/BotFather) trên Telegram → `/newbot` |
| `GEMINI_API_KEY` | Vào [Google AI Studio](https://aistudio.google.com/) → Get API Key |

---

## 🚀 Chạy bot

### Chạy thường (production)

```bash
npm start
```

### Chạy dev (tự restart khi sửa code)

```bash
npm run dev
```

### Dừng bot

Nhấn `Ctrl + C` trong terminal.

### Nếu bị lỗi 409 Conflict (nhiều instance)

```bash
# Windows
taskkill /F /IM node.exe

# Sau đó chạy lại
npm start
```

---

## 📱 Cách sử dụng trong Telegram

Tìm bot của bạn trên Telegram, rồi gõ:

### `/start`
Hiển thị hướng dẫn sử dụng.

### `/video <chủ đề>`

Tạo video tự động về chủ đề bất kỳ.

**Ví dụ:**
```
/video Cách làm giàu từ đầu tư chứng khoán
/video Mẹo học tiếng Anh hiệu quả cho người mất gốc
/video 5 thói quen của người thành công
/video Bí quyết giảm cân không cần nhịn ăn
```

**Quá trình bot hiển thị:**
```
🚀 Bắt đầu tạo video...
⏳ [██░░░░░░] 1/4 📝 Tạo kịch bản...
✅ Xong: 📝 Tạo kịch bản
⏳ [████░░░░] 2/4 🎨 Tạo slide...
✅ Xong: 🎨 Tạo slide
⏳ [██████░░] 3/4 🎙️ Tạo giọng đọc...
✅ Xong: 🎙️ Tạo giọng đọc
⏳ [████████] 4/4 🎬 Ghép video...
✅ Xong: 🎬 Ghép video
📤 Đang gửi video cho bạn...
```

> Thời gian tạo video: **~1–3 phút** tùy độ dài nội dung.

---

## 🗂️ Cấu trúc project

```
telegram-bot/
├── index.js                 # Entry point
├── package.json
├── .env                     # API keys (không commit lên git)
├── .env.example             # Template cấu hình
├── src/
│   ├── bot.js               # Logic Telegram bot + progress bar
│   ├── scriptGenerator.js   # Gọi Gemini AI sinh kịch bản
│   ├── slideCreator.js      # Tạo ảnh slide bằng Puppeteer
│   ├── ttsGenerator.js      # Chuyển text → giọng đọc (Google TTS)
│   └── videoCreator.js      # Ghép video bằng ffmpeg
└── temp/                    # File tạm (tự tạo, tự xóa sau 2 phút)
```

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Telegram Bot | `node-telegram-bot-api` |
| AI sinh kịch bản | Google Gemini 2.5 Flash |
| Render slide | Puppeteer (Chromium headless) |
| Giọng đọc | Google TTS miễn phí (`node-gtts`) |
| Ghép video | ffmpeg + `fluent-ffmpeg` |

---

## ❓ Troubleshooting

### Bot không phản hồi
- Kiểm tra `TELEGRAM_BOT_TOKEN` đúng chưa
- Đảm bảo chỉ chạy **1 instance** bot (xem lỗi 409 bên trên)

### Lỗi Gemini API
- Kiểm tra `GEMINI_API_KEY` còn hạn mức chưa tại [Google AI Studio](https://aistudio.google.com/)

### Lỗi ffmpeg
- Chạy `ffmpeg -version` trong terminal để kiểm tra
- Nếu không có: tải tại [ffmpeg.org](https://ffmpeg.org/download.html) và thêm vào PATH

### Slide không tạo được (Puppeteer lỗi)
```bash
# Cài lại Puppeteer
npm install puppeteer
```
