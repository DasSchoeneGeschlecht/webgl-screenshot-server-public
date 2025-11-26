const express = require('express');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();

// Accept large JSON payloads (important for screenshots)
app.use(bodyParser.json({ limit: '20mb' }));

// Initialize Resend using your API key from Render
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/upload-screenshot', async (req, res) => {
    try {
        const { image, filename } = req.body;

        if (!image || !filename) {
            return res.status(400).send('Missing image or filename');
        }

        // Convert base64 → buffer file
        const buffer = Buffer.from(image, 'base64');

        // Send email using Resend
        const emailResponse = await resend.emails.send({
            from: 'Screenshot Server <notifications@resend.dev>', 
            to: process.env.TO_EMAIL, // who receives the email
            subject: 'New Screenshot Uploaded',
            text: 'A new screenshot was uploaded from your game!',
            attachments: [
                {
                    filename: filename,
                    content: buffer
                }
            ]
        });

        console.log("Email sent:", emailResponse);
        res.send('Screenshot uploaded and emailed successfully!');
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).send('Server error');
    }
});

// Render uses a dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
