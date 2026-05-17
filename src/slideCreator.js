const puppeteer = require("puppeteer");
const path = require("path");

// ── Tạo palette màu từ hue + style ─────────────────────────────────────────
function buildPalette(hue = 220, style = "dark") {
  const h = ((hue % 360) + 360) % 360;
  const comp = (h + 180) % 360; // màu bổ sung
  const ana = (h + 30) % 360; // màu tương cận

  const presets = {
    dark: {
      bg1: `hsl(${h},   60%, 8%)`,
      bg2: `hsl(${h},   50%, 14%)`,
      bg3: `hsl(${ana}, 45%, 18%)`,
      accent: `hsl(${comp},90%, 65%)`,
      text: "#ffffff",
      sub: "rgba(255,255,255,0.72)",
      deco: "rgba(255,255,255,0.06)",
    },
    vibrant: {
      bg1: `hsl(${h},   80%, 35%)`,
      bg2: `hsl(${ana}, 75%, 42%)`,
      bg3: `hsl(${comp},70%, 30%)`,
      accent: `hsl(${comp},100%,80%)`,
      text: "#ffffff",
      sub: "rgba(255,255,255,0.85)",
      deco: "rgba(255,255,255,0.10)",
    },
    neon: {
      bg1: `hsl(${h},   20%, 5%)`,
      bg2: `hsl(${h},   15%, 10%)`,
      bg3: `hsl(${h},   10%, 14%)`,
      accent: `hsl(${h},  100%, 60%)`,
      text: `hsl(${h},  100%, 90%)`,
      sub: `hsl(${h},   40%, 70%)`,
      deco: `hsl(${h},  100%, 15%)`,
    },
    pastel: {
      bg1: `hsl(${h},   40%, 92%)`,
      bg2: `hsl(${ana}, 35%, 88%)`,
      bg3: `hsl(${comp},30%, 90%)`,
      accent: `hsl(${h},   65%, 45%)`,
      text: `hsl(${h},   30%, 20%)`,
      sub: `hsl(${h},   20%, 35%)`,
      deco: `hsl(${h},   50%, 70%)`,
    },
    earth: {
      bg1: `hsl(${h},   25%, 12%)`,
      bg2: `hsl(${ana}, 20%, 18%)`,
      bg3: `hsl(${comp},15%, 22%)`,
      accent: `hsl(${ana}, 70%, 58%)`,
      text: "#f5f0e8",
      sub: "rgba(245,240,232,0.75)",
      deco: "rgba(245,240,232,0.06)",
    },
  };

  return presets[style] || presets.dark;
}

// ── Random layout variant (0-3) ─────────────────────────────────────────────
function pickLayout(index) {
  return index % 4; // xoay vòng 4 layout
}

// ── Build HTML slide ────────────────────────────────────────────────────────
function buildHTML(slide, index, total, p, layout) {
  const pct = Math.round(((index + 1) / total) * 100);

  // Hình trang trí — khác nhau theo layout
  const decos = [
    // layout 0 — circles góc
    `<div style="position:absolute;width:420px;height:420px;border-radius:50%;
       background:${p.deco};top:-140px;right:-100px"></div>
     <div style="position:absolute;width:280px;height:280px;border-radius:50%;
       background:${p.deco};bottom:-80px;left:-60px"></div>`,

    // layout 1 — diagonal strip
    `<div style="position:absolute;width:200%;height:320px;
       background:${p.deco};transform:rotate(-8deg);top:160px;left:-50%"></div>`,

    // layout 2 — corner squares
    `<div style="position:absolute;width:180px;height:180px;
       background:${p.deco};top:0;right:0;border-radius:0 0 0 80px"></div>
     <div style="position:absolute;width:120px;height:120px;
       background:${p.deco};bottom:0;left:0;border-radius:0 80px 0 0"></div>`,

    // layout 3 — vertical bar
    `<div style="position:absolute;width:8px;height:100%;
       background:linear-gradient(to bottom,${p.accent},transparent);left:0;top:0"></div>
     <div style="position:absolute;width:360px;height:360px;border-radius:50%;
       background:${p.deco};top:50%;right:-80px;transform:translateY(-50%)"></div>`,
  ][layout];

  // Padding-left thêm cho layout 3 (có thanh dọc)
  const bodyPadding = layout === 3 ? "60px 70px 60px 80px" : "60px 70px";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  width:1280px;height:720px;overflow:hidden;
  background:linear-gradient(135deg,${p.bg1} 0%,${p.bg2} 55%,${p.bg3} 100%);
  font-family:'Inter',sans-serif;
  color:${p.text};
  display:flex;flex-direction:column;
  padding:${bodyPadding};
  position:relative;
}
.num{font-size:14px;font-weight:700;color:${p.accent};letter-spacing:3px;text-transform:uppercase;margin-bottom:6px}
.bar-bg{height:3px;background:rgba(128,128,128,.25);border-radius:2px;margin-bottom:46px}
.bar-fg{height:3px;background:${p.accent};border-radius:2px;width:${pct}%;
  box-shadow:0 0 8px ${p.accent}}
h1{font-size:56px;font-weight:900;line-height:1.18;margin-bottom:22px;max-width:920px;
  text-shadow:0 2px 20px rgba(0,0,0,.3)}
.accent-bar{width:64px;height:5px;border-radius:3px;background:${p.accent};margin-bottom:24px;
  box-shadow:0 0 12px ${p.accent}}
p{font-size:25px;line-height:1.65;color:${p.sub};max-width:940px;font-weight:400}
</style></head>
<body>
${decos}
<div class="num">SLIDE ${index + 1} / ${total}</div>
<div class="bar-bg"><div class="bar-fg"></div></div>
<h1>${slide.title}</h1>
<div class="accent-bar"></div>
<p>${slide.content}</p>
</body></html>`;
}

// ── Main export ─────────────────────────────────────────────────────────────
async function createSlides(script, tempDir) {
  // Lấy design từ Gemini, fallback nếu thiếu
  const design = script.design || {};
  const hue =
    typeof design.hue === "number"
      ? design.hue
      : Math.floor(Math.random() * 360);
  const style = design.style || "dark";

  const palette = buildPalette(hue, style);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const paths = [];
  for (let i = 0; i < script.slides.length; i++) {
    const layout = pickLayout(i);
    const html = buildHTML(
      script.slides[i],
      i,
      script.slides.length,
      palette,
      layout,
    );

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
    const outPath = path.join(tempDir, `slide_${i + 1}.png`);
    await page.screenshot({ path: outPath });
    paths.push(outPath);
  }

  await browser.close();
  return paths;
}

module.exports = { createSlides };
