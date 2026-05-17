const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateScript(topic) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Viết kịch bản video ngắn về: "${topic}".
Chia thành đúng 5 slide, trả về JSON hợp lệ (không markdown, không giải thích):
{
  "title": "Tên video",
  "design": {
    "hue": <số nguyên 0-360, chọn màu phù hợp chủ đề>,
    "style": "<một trong: vibrant | dark | pastel | neon | earth>"
  },
  "slides": [
    {
      "title": "Tiêu đề slide (tối đa 8 từ)",
      "content": "Nội dung 2-3 câu hiển thị trên slide",
      "narration": "Lời thuyết minh tự nhiên cho slide này"
    }
  ]
}

Gợi ý chọn màu theo chủ đề:
- Tài chính/kinh doanh: hue 200-220 (xanh lam), style dark
- Sức khỏe/thiên nhiên: hue 120-150 (xanh lá), style earth
- Công nghệ: hue 240-270 (tím/indigo), style neon
- Năng lượng/động lực: hue 20-40 (cam), style vibrant
- Giáo dục/học thuật: hue 180-210 (teal), style pastel`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini không trả về JSON hợp lệ');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateScript };
