const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();

// Enable CORS for all origins (Unity WebGL requires this)
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Accept large JSON payloads for screenshots
app.use(bodyParser.json({ limit: '20mb' }));

// Resend email client
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/upload-screenshot', async (req, res) => {
    try {
        const { image, filename } = req.body;

        if (!image || !filename) {
            return res.status(400).send('Missing image or filename');
        }

        const buffer = Buffer.from(image, 'base64');

        await resend.emails.send({
            from: 'Screenshot Server <notifications@resend.dev>',
            to: process.env.TO_EMAIL,
            subject: 'New Screenshot Uploaded',
            text: 'A new screenshot was uploaded from your game!',
            attachments: [
                {
                    filename,
                    content: buffer
                }
            ]
        });

        res.send('Screenshot uploaded and emailed successfully!');
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).send('Server error');
    }
});

// For Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
