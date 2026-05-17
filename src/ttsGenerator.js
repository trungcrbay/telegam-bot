const gtts = require('node-gtts');
const path = require('path');

function textToSpeech(text, outputPath, lang = 'vi') {
  return new Promise((resolve, reject) => {
    const tts = gtts(lang);
    tts.save(outputPath, text, (err) => {
      if (err) reject(err);
      else resolve(outputPath);
    });
  });
}

async function generateAllTTS(script, tempDir) {
  const paths = [];
  for (let i = 0; i < script.slides.length; i++) {
    const outPath = path.join(tempDir, `audio_${i + 1}.mp3`);
    await textToSpeech(script.slides[i].narration, outPath);
    paths.push(outPath);
  }
  return paths;
}

module.exports = { generateAllTTS };
