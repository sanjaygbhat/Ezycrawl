const express = require('express');
const axios = require('axios');
const config = require('./config');

const router = express.Router();

router.post('/process', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Fetch data from Jina Reader API
        console.log(`Requesting data from Jina Reader API for URL: ${url}`);
        const jinaResponse = await axios.post(config.jinaReaderApiUrl, { url });
        const data = jinaResponse.data;

        // Log the data received from Jina Reader API
        console.log('Data received from Jina Reader API:', data);

        // Use GPT-4 API to process the data
        console.log('Sending data to GPT-4 API...');
        const gptResponse = await axios.post('https://api.openai.com/v1/gpt4o', data, {
            headers: {
                'Authorization': `Bearer ${config.gpt4oKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Log the response from GPT-4 API
        console.log('Response from GPT-4 API:', gptResponse.data);

        return res.json(gptResponse.data);
    } catch (error) {
        console.error('Error occurred:', error);
        
        // Log specific error details
        if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request data:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
