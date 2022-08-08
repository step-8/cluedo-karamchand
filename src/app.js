const express = require('express');
const morgan = require('morgan');
const { homePage,
  injectGame,
  addPlayerToGame,
  serveLobby } = require('./handlers/homePage.js');

require('dotenv').config();

const cookieSession = require('cookie-session');
const { urlencoded } = require('express');
const { serveLogin, handleLogin } = require('./handlers/loginHandler.js');

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

  app.get('/', homePage);
  app.post('/join', injectGame(games), addPlayerToGame, serveLobby);
  app.use(express.static('public'));

  return app;
};

module.exports = { createApp };
