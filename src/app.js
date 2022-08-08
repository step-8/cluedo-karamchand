const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const cookieSession = require('cookie-session');
const { urlencoded } = require('express');
const { serveLogin, handleLogin } = require('./handlers/loginHandler.js');

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  app.use(cookieSession({
    name: process.env.SESSION_NAME,
    keys: [process.env.SESSION_KEYS]
  }));

  app.use(urlencoded({ extended: true }));

  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }

  app.get('/login', serveLogin);
  app.post('/login', handleLogin);

  return app;
};

module.exports = { createApp };
