const express = require('express');
const app = express();
app.get('/api/test', (req, res) => res.send('OK'));
const req = { url: '/api/test?slug=test', method: 'GET' };
const res = { 
  end: (d) => console.log('END:', d), 
  send: (d) => console.log('SEND:', d),
  setHeader: () => {},
  getHeader: () => {},
};
app(req, res);
