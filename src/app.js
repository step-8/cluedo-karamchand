const express = require('express');
const morgan = require('morgan');
const { homePage,
  injectGame,
  addPlayerToGame,
  serveLobby } = require('./handlers/homePage.js');

require('dotenv').config();

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  app.use(express.urlencoded({ extended: true }));

  const games = {
    123: {
      gameId: 123,
      players: [{ name: 'abc', character: 'scarlatte', userId: 1 }],
      characters: ['scarlatte', 'mustard', 'green'],
      maxPlayers: 3
    }
  };

  if (MODE === 'PRODUCTION') {
    app.use(morgan('tiny'));
  }

  app.get('/', homePage);
  app.post('/join', injectGame(games), addPlayerToGame, serveLobby);
  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
