const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();

// Accept large JSON payloads (screenshots can be big)
app.use(bodyParser.json({ limit: '15mb' }));

app.post('/upload-screenshot', async (req, res) => {
    try {
        const { image, filename } = req.body;
        if (!image || !filename) return res.status(400).send('Missing image or filename');

        const buffer = Buffer.from(image, 'base64');

        // GMX SMTP configuration
        const transporter = nodemailer.createTransport({
            host: "mail.gmx.net",
            port: 587,
            secure: false, // GMX uses STARTTLS (not SSL)
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, 
            subject: 'New Screenshot Uploaded',
            text: 'A new screenshot was uploaded from your game!',
            attachments: [{ filename, content: buffer }]
        });

        res.send('Screenshot uploaded and emailed successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Render will set PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
