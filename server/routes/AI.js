const express = require('express');
const router = express.Router();
const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY;

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: "command", // or "command-light"
        message: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ ai: response.data.text });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;