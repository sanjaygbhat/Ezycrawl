const express = require('express');
const axios = require('axios');
const db = require('../src/dbConfig'); // Adjust the path as necessary
const config = require('../src/config');
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: config.gpt4oKey
});
const router = express.Router();
async function Gptresponse(data, labels = []) {
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
router.post('/api/scrape', async (req, res) => {
    const { url, attributes, apiKey } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        return res.status(400).json({ error: 'Valid API key is required' });
    }
    const sanitizedApiKey = apiKey.trim();
    try {
        let apiKeyResult;
        try {
            apiKeyResult = await db.query('SELECT * FROM api_keys WHERE key = $1', [sanitizedApiKey]);
        } catch (dbError) {
            console.error('Database operation error:', dbError);
            console.error('Error stack:', dbError.stack);
            return res.status(500).json({ error: 'Database error', details: dbError.message });
        }
        if (!apiKeyResult || apiKeyResult.length === 0) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        const fullUrl = `https://r.jina.ai/${url}`;
        let jinaResponse;
        try {
            jinaResponse = await axios.get(fullUrl, {
                headers: {
                    "X-Return-Format": "text"
                }
            });
        } catch (axiosError) {
            console.error('Axios request error:', axiosError);
            return res.status(500).json({ error: 'Failed to fetch data from Jina AI', details: axiosError.message });
        }
        const data = jinaResponse.data;
        let gptResponse;
        try {
            gptResponse = await Gptresponse(data, attributes);
        } catch (gptError) {
            console.error('GPT API error:', gptError);
            return res.status(500).json({ error: 'GPT API Error', details: gptError.message });
        }
        if (!gptResponse || gptResponse.error) {
            const errorStatus = gptResponse ? gptResponse.status : 500;
            const errorMessage = gptResponse ? gptResponse.error : 'GPT API Error';
            console.error('GPT API responded with error:', errorStatus, errorMessage);
            return res.status(errorStatus).json({ error: errorMessage });
        }
        return res.json(JSON.parse(gptResponse.choices[0].message.content));
    } catch (error) {
        console.error('Unexpected error in /api/scrape:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
module.exports = router;
