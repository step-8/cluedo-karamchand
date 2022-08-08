const express = require('express');
const morgan = require('morgan');
const { boardHandler, boardApi } = require('./handlers/boardHandler');
require('dotenv').config();
const fs = require('fs');

const createApp = () => {
  const boardData = fs.readFileSync('data/board.json', 'utf-8');
  const app = express();
  const MODE = process.env.ENV;

  if (MODE === 'PRODUCTION') {
    app.use(morgan('tiny'));
  }

  app.get('/game', boardHandler);
  app.get('/boardApi', boardApi(boardData));
  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
