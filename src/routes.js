const express = require('express');
const axios = require('axios');
const config = require('./config');
const OpenAI = require('openai');
const router = express.Router();
const openai = new OpenAI({
    apiKey: config.gpt4oKey
});

async function Gptresponse(data, labels = []){
    console.log(labels);
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: `Read the info provided, only give me data that have ${labels.join(', ')} as their attribute , store multiple values if needed and respond in JSON format` },
            { role: "user", content: data }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0
      });
    return completion;
}

router.post('/process', async (req, res) => {
    const { url, labels } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const safeLabels = Array.isArray(labels) ? labels : [];

    try {
        const fullUrl = `https://r.jina.ai/${url}`;
        const jinaResponse = await axios.get(fullUrl, {
            headers: {
                "X-Return-Format": "text"
            }
        });
        const data = jinaResponse.data;
        console.log(data);

        const gptResponse = await Gptresponse(data, safeLabels);
        if (!gptResponse || gptResponse.error) {
            const errorStatus = gptResponse ? gptResponse.status : 500;
            const errorMessage = gptResponse ? gptResponse.error : 'GPT API Error';
            console.error('GPT API responded with error:', errorStatus, errorMessage);
            return res.status(errorStatus).json({ error: errorMessage });
        }
        return res.json(JSON.parse(gptResponse.choices[0].message.content));
    } catch (error) {
        console.error('Error in /process route:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
