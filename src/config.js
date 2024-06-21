// src/config.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    jinaReaderApiUrl: process.env.JINA_READER_API_URL,
    gpt4oKey: process.env.GPT4O_KEY,
};

module.exports = config;