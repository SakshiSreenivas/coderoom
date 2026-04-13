const axios = require('axios');
require('dotenv').config();

console.log('Client ID:', process.env.JDOODLE_CLIENT_ID);
console.log('Secret length:', process.env.JDOODLE_CLIENT_SECRET?.length);

axios.post('https://api.jdoodle.com/v1/execute', {
  script: 'print("hello")',
  language: 'python3',
  versionIndex: '4',
  clientId: process.env.JDOODLE_CLIENT_ID,
  clientSecret: process.env.JDOODLE_CLIENT_SECRET
}, {
  headers: { 'Content-Type': 'application/json' }
})
.then(r => console.log('SUCCESS:', r.data))
.catch(e => console.log('ERROR:', e.response?.data || e.message))