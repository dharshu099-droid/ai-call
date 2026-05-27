const express = require('express');

const gTTS = require('google-tts-api');

const app = express();

app.get('/tts', (req, res) => {

  const text = req.query.text;

  const lang = req.query.lang || 'ta';

  const url = gTTS.getAudioUrl(text, {

    lang: lang,

    slow: false,

    host: 'https://translate.google.com',

  });

  res.redirect(url);

});

app.listen(3000, () => {

  console.log('TTS Server Running');

});