const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cookieSession = require('cookie-session');

const boardData = require('../data/board.json');
const cards = require('../data/cards.json');
const cellPositions = require('../data/cellPositions.json');

const { serveHomePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
const { createLoginRouter } = require('./routers/loginRouter.js');
const { hostGame } = require('./handlers/hostGameHandler.js');
const { createApiRouter } = require('./routers/apiRouter.js');
const { injectGame,
  injectGameId,
  addPlayerToGame, isUserInGame } = require('./middleware/gameMiddleware.js');
const { createGameRouter } = require('./routers/gameRouter.js');

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  const games = {};

  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieSession({
    name: process.env.SESSION_NAME,
    keys: [process.env.SESSION_KEYS]
  }));

  const loginRouter = createLoginRouter();
  const gameRouter = createGameRouter(games, cards, cellPositions);
  const apiRouter = createApiRouter(games, boardData, cards);

  app.use('/login', loginRouter);
  app.use('/game', gameRouter);
  app.use('/api', apiRouter);

  app.get('/', validateUser, isUserInGame(games), serveHomePage);
  app.post('/host',
    validateUser, hostGame(games, cellPositions.startingPositions));
  app.post('/join', validateUser, injectGameId(games),
    injectGame(games), addPlayerToGame, redirectToLobby);

  app.get('/lobby/:gameId', validateUser, serveLobby);

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
