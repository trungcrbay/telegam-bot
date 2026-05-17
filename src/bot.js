const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { generateScript } = require('./scriptGenerator');
const { createSlides } = require('./slideCreator');
const { generateAllTTS } = require('./ttsGenerator');
const { createVideo } = require('./videoCreator');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const TEMP_DIR = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function bar(step, total) {
  const filled = Math.round((step / total) * 8);
  return '█'.repeat(filled) + '░'.repeat(8 - filled);
}

async function edit(bot, chatId, msgId, text) {
  return bot.editMessageText(text, { chat_id: chatId, message_id: msgId }).catch(() => {});
}

// ── /start ──────────────────────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Xin chào! Tôi là *Auto Video Bot*\n\n` +
    `Chỉ cần gõ:\n\`/video <chủ đề>\`\n\n` +
    `Ví dụ:\n` +
    `\`/video Cách làm giàu từ đầu tư\`\n` +
    `\`/video Mẹo học tiếng Anh hiệu quả\`\n` +
    `\`/video 5 thói quen của người thành công\``,
    { parse_mode: 'Markdown' }
  );
});

// ── /video <topic> ──────────────────────────────────────────────────────────
bot.onText(/\/video (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const topic = match[1].trim();

  const jobId = uuidv4();
  const tempDir = path.join(TEMP_DIR, jobId);
  fs.mkdirSync(tempDir, { recursive: true });

  let statusMsg;

  try {
    statusMsg = await bot.sendMessage(chatId, '🚀 Bắt đầu tạo video...');
    await sleep(400);

    // ── Step 1: Script ───────────────────────────────────────────────────
    await edit(bot, chatId, statusMsg.message_id, `⏳ [${bar(0, 4)}] 1/4 📝 Tạo kịch bản...`);
    const script = await generateScript(topic);
    await edit(bot, chatId, statusMsg.message_id, `✅ Xong: 📝 Tạo kịch bản`);
    await sleep(300);

    // ── Step 2: Slides ───────────────────────────────────────────────────
    await edit(bot, chatId, statusMsg.message_id, `⏳ [${bar(1, 4)}] 2/4 🎨 Tạo slide...`);
    const slidePaths = await createSlides(script, tempDir);
    await edit(bot, chatId, statusMsg.message_id, `✅ Xong: 🎨 Tạo slide`);
    await sleep(300);

    // ── Step 3: TTS ──────────────────────────────────────────────────────
    await edit(bot, chatId, statusMsg.message_id, `⏳ [${bar(2, 4)}] 3/4 🎙️ Tạo giọng đọc...`);
    const audioPaths = await generateAllTTS(script, tempDir);
    await edit(bot, chatId, statusMsg.message_id, `✅ Xong: 🎙️ Tạo giọng đọc`);
    await sleep(300);

    // ── Step 4: Video ────────────────────────────────────────────────────
    await edit(bot, chatId, statusMsg.message_id, `⏳ [${bar(3, 4)}] 4/4 🎬 Ghép video...`);
    const videoPath = path.join(tempDir, 'output.mp4');
    await createVideo(slidePaths, audioPaths, tempDir, videoPath);
    await edit(bot, chatId, statusMsg.message_id, `✅ Xong: 🎬 Ghép video`);

    // ── Send ─────────────────────────────────────────────────────────────
    await bot.sendMessage(chatId, '📤 Đang gửi video cho bạn...');
    await bot.sendVideo(chatId, videoPath, {
      caption: `🎬 *${script.title}*\n📝 Chủ đề: ${topic}`,
      parse_mode: 'Markdown',
    });
  } catch (err) {
    console.error('[BOT ERROR]', err);
    const errMsg = `❌ Lỗi: ${err.message}`;
    if (statusMsg) {
      await edit(bot, chatId, statusMsg.message_id, errMsg);
    } else {
      await bot.sendMessage(chatId, errMsg);
    }
  } finally {
    // Dọn dẹp sau 2 phút
    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, 120_000);
  }
});

// ── Lệnh không hợp lệ ───────────────────────────────────────────────────────
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, `💡 Gõ /video <chủ đề> để bắt đầu nhé!\nVí dụ: /video Cách kiếm tiền online`);
  }
});

console.log('🤖 Auto Video Bot đang chạy...');
