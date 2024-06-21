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
            { role: "system", content: `Read the info provided, give me ${labels.join(', ')} and respond in JSON format` },
            { role: "user", content: data }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0
      });
    return completion;
}

router.post('/process', async (req, res) => {
    const { url, labels } = req.body; // Extract labels along with the url from the request body
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Ensure labels is always an array, even if not provided or not in array format
    const safeLabels = Array.isArray(labels) ? labels : [];

    try {
        const fullUrl = `${config.jinaReaderApiUrl}${url}`;
        const jinaResponse = await axios.get(fullUrl);
        const data = jinaResponse.data;

        const gptResponse = await Gptresponse(data, safeLabels); // Pass safeLabels to Gptresponse
        // Check if gptResponse is undefined or contains an error field
        if (!gptResponse || gptResponse.error) {
            // Log the entire gptResponse object in a pretty format for better readability
            const errorStatus = gptResponse ? gptResponse.status : 500; // Use 500 as a fallback status code
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
