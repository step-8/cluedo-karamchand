const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
require('dotenv').config();

const { homePage,
  injectGame,
  addPlayerToGame,
  serveLobby } = require('./handlers/homePage.js');
const { createLoginRouter } = require('./routers/loginRouter.js');

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

  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }

  const loginRouter = createLoginRouter();
  app.use('/login', loginRouter);

  app.get('/', homePage);
  app.post('/join', injectGame(games), addPlayerToGame, serveLobby);
  app.use(express.static('public'));

  return app;
};

module.exports = { createApp };
