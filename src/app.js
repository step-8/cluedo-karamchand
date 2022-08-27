const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
require('dotenv').config();

const boardData = require('../data/board.json');
const cards = require('../data/cards.json');
const gameDetails = require('../data/gameDetails.json');

const { validateUser } = require('./middleware/validateUser.js');
const { isUserInGame, isUserInLobby } =
  require('./middleware/gameMiddleware.js');

const { serveHomePage } = require('./handlers/servePages.js');

const { createAuthRouter } = require('./routers/authRouter.js');
const { createApiRouter } = require('./routers/apiRouter.js');
const { createGameRouter } = require('./routers/gameRouter.js');
const { createLobbyRouter } = require('./routers/lobbyRouter.js');
const { notFoundHandler } = require('./handlers/notFoundHandler.js');

const createApp = () => {
  const games = {};
  const lobbies = {};
  const app = express();

  const MODE = process.env.ENV;
  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }

  app.set('view engine', 'pug');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieSession({
    name: process.env.SESSION_NAME,
    keys: [process.env.SESSION_KEYS]
  }));

  const authRouter = createAuthRouter();
  const gameRouter =
    createGameRouter(games, lobbies, cards, gameDetails, boardData);
  const apiRouter = createApiRouter(games, lobbies);
  const lobbyRouter = createLobbyRouter(games, lobbies, cards);

  app.get('/',
    validateUser, isUserInGame(games), isUserInLobby(lobbies), serveHomePage);

  app.use(authRouter);
  app.use('/game', gameRouter);
  app.use('/api', apiRouter);
  app.use('/lobby', lobbyRouter);

  app.use(compression(), express.static('public'));
  app.use(notFoundHandler);
  return app;
};

module.exports = { createApp };
