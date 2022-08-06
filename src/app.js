const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  if (MODE === 'PRODUCTION') {
    app.use(morgan('tiny'));
  }

  return app;
};

module.exports = { createApp };
