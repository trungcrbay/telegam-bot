const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, meta) => {
      if (err) reject(err);
      else resolve(meta.format.duration || 3);
    });
  });
}

function makeClip(imagePath, audioPath, outputPath, duration) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop 1', `-t ${duration + 0.5}`])
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 128k',
        '-pix_fmt yuv420p',
        '-shortest',
        '-vf scale=1280:720',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function concatClips(clipPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const listPath = outputPath.replace('.mp4', '_list.txt');
    const content = clipPaths.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listPath, content, 'utf8');

    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(outputPath)
      .on('end', () => {
        try { fs.unlinkSync(listPath); } catch {}
        resolve(outputPath);
      })
      .on('error', reject)
      .run();
  });
}

async function createVideo(slidePaths, audioPaths, tempDir, outputPath) {
  const clipPaths = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const duration = await getAudioDuration(audioPaths[i]);
    const clipPath = path.join(tempDir, `clip_${i + 1}.mp4`);
    await makeClip(slidePaths[i], audioPaths[i], clipPath, duration);
    clipPaths.push(clipPath);
  }
  await concatClips(clipPaths, outputPath);
  return outputPath;
}

module.exports = { createVideo };
