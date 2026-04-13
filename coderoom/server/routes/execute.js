const express = require('express');
const router = express.Router();
const axios = require('axios');

const LANGUAGE_MAP = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '1' }
};

router.post('/', async (req, res) => {
  const { code, language } = req.body;
  const lang = LANGUAGE_MAP[language] || LANGUAGE_MAP['javascript'];

  try {
    const response = await axios.post(
      'https://api.jdoodle.com/v1/execute',
      {
        script: code,
        language: lang.language,
        versionIndex: lang.versionIndex,
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const { output, statusCode } = response.data;

    res.json({
      stdout: statusCode === 200 ? output : null,
      stderr: statusCode !== 200 ? output : null,
      compileOutput: null,
      status: statusCode === 200 ? 'Accepted' : 'Error',
      time: null,
      memory: null
    });

  } catch (err) {
    res.status(500).json({
      message: 'Execution failed',
      error: err.response?.data || err.message
    });
  }
});

module.exports = router;