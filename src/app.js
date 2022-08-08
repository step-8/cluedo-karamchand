const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cookieSession = require('cookie-session');

const { homePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { injectGame, addPlayerToGame } = require('./middleware/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
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

  app.get('/', validateUser, homePage);
  app.post('/join', validateUser,
    injectGame(games), addPlayerToGame, redirectToLobby);
  app.get('/lobby', validateUser, serveLobby);

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
