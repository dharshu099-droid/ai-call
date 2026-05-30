console.log("NEW SERVER VERSION");

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('./db');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// AUDIO FOLDER
// =====================================

const audioFolder = path.join(__dirname, 'audio');

if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder, { recursive: true });
}

console.log("Audio folder:", audioFolder);

app.use('/audio', express.static(audioFolder));

// =====================================
// DEBUG ROUTES
// =====================================

app.get('/audio-path', (req, res) => {
    res.send(audioFolder);
});

app.get('/list-audio', (req, res) => {
    try {
        const files = fs.readdirSync(audioFolder);
        res.json(files);
    } catch (err) {
        res.json({
            error: err.message
        });
    }
});

// =====================================
// SAVE RESPONSE
// =====================================

app.post('/save-response', (req, res) => {

    const {
        phone_number,
        language,
        question_number,
        answer
    } = req.body;

    db.query(
        `INSERT INTO responses
        (phone_number, language, question_number, answer)
        VALUES (?, ?, ?, ?)`,
        [
            phone_number,
            language,
            question_number,
            answer
        ],
        (err) => {

            if (err) {
                console.log(err);
                return res.send('Database Error');
            }

            console.log('Saved');
            res.send('Saved');
        }
    );
});

// =====================================
// GENERATE TTS
// =====================================

app.post('/generate-tts', async (req, res) => {

    try {

        const { text, lang } = req.body;

        console.log("REQ:", req.body);

        const response = await axios.post(
            'https://api.sarvam.ai/text-to-speech',
            {
                inputs: [text],
                target_language_code: lang,
                speaker: 'anushka'
            },
            {
                headers: {
                    'api-subscription-key':
                    process.env.SARVAM_API_KEY,
                    'Content-Type':
                    'application/json'
                }
            }
        );

        const base64Audio =
            response.data.audios[0]
                .replace(/^data:audio\/wav;base64,/, '');

        const fileName =
            `audio_${Date.now()}.wav`;

        const filePath =
            path.join(audioFolder, fileName);

        console.log("Saving to:", filePath);
        console.log("Audio length:", base64Audio.length);

        fs.writeFileSync(
            filePath,
            Buffer.from(base64Audio, 'base64')
        );

        console.log("File saved successfully");

        const files =
            fs.readdirSync(audioFolder);

        console.log("Current files:", files);

        const audioUrl =
            `https://${req.get('host')}/audio/${fileName}`;

        console.log("Audio URL:", audioUrl);

        res.json({
            audioUrl
        });

    } catch (err) {

        console.log(
            "TTS ERROR:",
            err.response?.data || err.message
        );

        res.status(500).json({
            error: 'TTS Failed'
        });
    }
});

// =====================================
// TEST TAMIL
// =====================================

app.get('/test-tamil', async (req, res) => {

    try {

        console.log("SARVAM KEY EXISTS:", !!process.env.SARVAM_API_KEY);
        console.log("KEY LENGTH:", process.env.SARVAM_API_KEY?.length);

        const response = await axios.post(
            'https://api.sarvam.ai/text-to-speech',
            {
                inputs: ['வணக்கம் எப்படி இருக்கீங்க'],
                target_language_code: 'ta-IN',
                speaker: 'anushka'
            },
            {
                headers: {
                    'api-subscription-key':
                    process.env.SARVAM_API_KEY,
                    'Content-Type':
                    'application/json'
                }
            }
        );

        const base64Audio =
            response.data.audios[0]
                .replace(/^data:audio\/wav;base64,/, '');

        const filePath =
            path.join(audioFolder, 'test.wav');

        fs.writeFileSync(
            filePath,
            Buffer.from(base64Audio, 'base64')
        );

        console.log("test.wav created");

        res.send(`
        <html>
        <body>
            <h2>Tamil Audio Test</h2>
            <audio controls autoplay>
                <source src="/audio/test.wav" type="audio/wav">
            </audio>
        </body>
        </html>
        `);

    } catch (err) {

        console.log(
            err.response?.data || err.message
        );

        res.send('Sarvam failed');
    }
});

// =====================================
// HOME
// =====================================

app.get('/', (req, res) => {
    res.send('Server working');
});

// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});