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
    fs.mkdirSync(audioFolder);
}

app.use('/audio', express.static(audioFolder));

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

        const {
            text,
            lang
        } = req.body;

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

        // BASE64 AUDIO
        const base64Audio =
        response.data.audios[0]
        .replace(/^data:audio\/wav;base64,/, '');

        // FILE NAME
        const fileName =
        `audio_${Date.now()}.wav`;

        // FILE PATH
        const filePath =
        path.join(audioFolder, fileName);

        // SAVE FILE
        fs.writeFileSync(

            filePath,

            Buffer.from(base64Audio, 'base64')

        );

        // PUBLIC URL
        const audioUrl =
        `${req.protocol}://${req.get('host')}/audio/${fileName}`;

        console.log(audioUrl);

        // SEND URL
        res.json({

            audioUrl: audioUrl

        });

    } catch (err) {

        console.log(
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

        // BASE64 AUDIO
        const base64Audio =
        response.data.audios[0]
        .replace(/^data:audio\/wav;base64,/, '');

        // FILE PATH
        const filePath =
        path.join(audioFolder, 'test.wav');

        // SAVE FILE
        fs.writeFileSync(

            filePath,

            Buffer.from(base64Audio, 'base64')

        );

        res.send(`
            <audio controls autoplay>
                <source src="/audio/test.wav" type="audio/wav">
            </audio>
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