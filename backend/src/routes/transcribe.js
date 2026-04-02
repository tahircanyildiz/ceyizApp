const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const authMiddleware = require('../middleware/auth');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.use(authMiddleware);

router.post('/', async (req, res) => {
  let tmpPath = null;
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ message: 'Ses verisi gerekli' });

    const buffer = Buffer.from(audio, 'base64');
    tmpPath = path.join(os.tmpdir(), `recording_${Date.now()}.m4a`);
    fs.writeFileSync(tmpPath, buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-1',
      language: 'tr',
    });

    res.json({ text: transcription.text });
  } catch (err) {
    console.error('Transcribe error:', err.message);
    res.status(500).json({ message: 'Ses tanıma başarısız', error: err.message });
  } finally {
    if (tmpPath) fs.unlink(tmpPath, () => {});
  }
});

module.exports = router;
