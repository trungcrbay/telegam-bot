const { Resvg } = require('@resvg/resvg-js');
const path = require('path');
const fs = require('fs');

const WIDTH = 1280;
const HEIGHT = 720;

function buildPalette(hue = 220, style = 'dark') {
  const h = ((hue % 360) + 360) % 360;
  const comp = (h + 180) % 360;
  const ana = (h + 30) % 360;

  const presets = {
    dark: {
      bg1: `hsl(${h}, 60%, 8%)`,
      bg2: `hsl(${h}, 50%, 14%)`,
      bg3: `hsl(${ana}, 45%, 18%)`,
      accent: `hsl(${comp}, 90%, 65%)`,
      text: '#ffffff',
      sub: 'rgba(255,255,255,0.72)',
      deco: 'rgba(255,255,255,0.06)',
    },
    vibrant: {
      bg1: `hsl(${h}, 80%, 35%)`,
      bg2: `hsl(${ana}, 75%, 42%)`,
      bg3: `hsl(${comp}, 70%, 30%)`,
      accent: `hsl(${comp}, 100%, 80%)`,
      text: '#ffffff',
      sub: 'rgba(255,255,255,0.85)',
      deco: 'rgba(255,255,255,0.10)',
    },
    neon: {
      bg1: `hsl(${h}, 20%, 5%)`,
      bg2: `hsl(${h}, 15%, 10%)`,
      bg3: `hsl(${h}, 10%, 14%)`,
      accent: `hsl(${h}, 100%, 60%)`,
      text: `hsl(${h}, 100%, 90%)`,
      sub: `hsl(${h}, 40%, 70%)`,
      deco: `hsl(${h}, 100%, 15%)`,
    },
    pastel: {
      bg1: `hsl(${h}, 40%, 92%)`,
      bg2: `hsl(${ana}, 35%, 88%)`,
      bg3: `hsl(${comp}, 30%, 90%)`,
      accent: `hsl(${h}, 65%, 45%)`,
      text: `hsl(${h}, 30%, 20%)`,
      sub: `hsl(${h}, 20%, 35%)`,
      deco: `hsl(${h}, 50%, 70%)`,
    },
    earth: {
      bg1: `hsl(${h}, 25%, 12%)`,
      bg2: `hsl(${ana}, 20%, 18%)`,
      bg3: `hsl(${comp}, 15%, 22%)`,
      accent: `hsl(${ana}, 70%, 58%)`,
      text: '#f5f0e8',
      sub: 'rgba(245,240,232,0.75)',
      deco: 'rgba(245,240,232,0.06)',
    },
  };

  return presets[style] || presets.dark;
}

function pickLayout(index) {
  return index % 4;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars) {
  const paragraphs = String(text || '').split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const testLine = `${current} ${words[i]}`;
      if (testLine.length <= maxChars) {
        current = testLine;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }

  return lines;
}

function fitText(text, widthChars, sizes) {
  for (const size of sizes) {
    const maxChars = Math.max(8, Math.floor(widthChars * (56 / size)));
    const lines = wrapText(text, maxChars);
    const maxLines = size >= 50 ? 4 : 6;
    if (lines.length <= maxLines) {
      return { size, lines };
    }
  }

  const size = sizes[sizes.length - 1];
  const maxChars = Math.max(8, Math.floor(widthChars * (56 / size)));
  return { size, lines: wrapText(text, maxChars) };
}

function buildBackground(layout, p) {
  if (layout === 0) {
    return `
      <circle cx="1180" cy="-60" r="260" fill="${p.deco}" />
      <circle cx="95" cy="760" r="190" fill="${p.deco}" />
    `;
  }

  if (layout === 1) {
    return `
      <g transform="translate(640 360) rotate(-8)">
        <rect x="-1280" y="138" width="2560" height="120" fill="${p.deco}" />
      </g>
    `;
  }

  if (layout === 2) {
    return `
      <rect x="1100" y="0" width="180" height="180" rx="80" fill="${p.deco}" />
      <rect x="0" y="600" width="120" height="120" rx="60" fill="${p.deco}" />
    `;
  }

  return `
    <rect x="0" y="0" width="8" height="720" fill="url(#accentBar)" />
    <circle cx="1200" cy="360" r="180" fill="${p.deco}" />
  `;
}

function buildSvg(slide, index, total, p, layout) {
  const pct = Math.round(((index + 1) / total) * 100);
  const left = layout === 3 ? 80 : 70;
  const right = 70;
  const titleAreaWidth = WIDTH - left - right;
  const contentAreaWidth = WIDTH - left - right;

  const titleFit = fitText(slide.title, Math.floor(titleAreaWidth / 18), [58, 52, 46, 40, 36, 32]);
  const contentFit = fitText(slide.content, Math.floor(contentAreaWidth / 14), [28, 26, 24, 22, 20, 18]);

  const titleSize = titleFit.size;
  const contentSize = contentFit.size;
  const titleLineHeight = Math.round(titleSize * 1.12);
  const contentLineHeight = Math.round(contentSize * 1.55);
  const titleLines = titleFit.lines.slice(0, 4);
  const contentLines = contentFit.lines.slice(0, 6);

  const titleY = 170;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const contentY = titleY + titleBlockHeight + 52;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.bg1}" />
        <stop offset="55%" stop-color="${p.bg2}" />
        <stop offset="100%" stop-color="${p.bg3}" />
      </linearGradient>
      <linearGradient id="progressTrack" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.16)" />
      </linearGradient>
      <linearGradient id="accentBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.accent}" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="8" flood-color="rgba(0,0,0,0.28)" />
      </filter>
    </defs>

    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
    ${buildBackground(layout, p)}

    <text x="${left}" y="66" fill="${p.accent}" font-size="14" font-weight="700" letter-spacing="3" font-family="Arial, sans-serif">SLIDE ${index + 1} / ${total}</text>

    <rect x="${left}" y="128" width="${WIDTH - left - right}" height="3" rx="2" fill="url(#progressTrack)" />
    <rect x="${left}" y="128" width="${((WIDTH - left - right) * pct) / 100}" height="3" rx="2" fill="${p.accent}" />

    <g filter="url(#shadow)">
      ${titleLines
        .map(
          (line, lineIndex) => `<text x="${left}" y="${titleY + lineIndex * titleLineHeight}" fill="${p.text}" font-size="${titleSize}" font-weight="900" font-family="Arial, sans-serif">${escapeXml(line)}</text>`,
        )
        .join('')}
    </g>

    <rect x="${left}" y="${titleY + titleBlockHeight + 12}" width="64" height="5" rx="3" fill="${p.accent}" />

    ${contentLines
      .map(
        (line, lineIndex) => `<text x="${left}" y="${contentY + lineIndex * contentLineHeight}" fill="${p.sub}" font-size="${contentSize}" font-weight="400" font-family="Arial, sans-serif">${escapeXml(line)}</text>`,
      )
      .join('')}
  </svg>`;
}

async function createSlides(script, tempDir) {
  const design = script.design || {};
  const hue = typeof design.hue === 'number' ? design.hue : Math.floor(Math.random() * 360);
  const style = design.style || 'dark';
  const palette = buildPalette(hue, style);

  const paths = [];
  for (let i = 0; i < script.slides.length; i++) {
    const layout = pickLayout(i);
    const svg = buildSvg(script.slides[i], i, script.slides.length, palette, layout);
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: WIDTH,
      },
    });
    const pngData = resvg.render();
    const outPath = path.join(tempDir, `slide_${i + 1}.png`);
    fs.writeFileSync(outPath, pngData.asPng());
    paths.push(outPath);
  }

  return paths;
}

module.exports = { createSlides };
