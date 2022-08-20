const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
require('dotenv').config();

const boardData = require('../data/board.json');
const cards = require('../data/cards.json');
const cellPositions = require('../data/gameDetails.json');

const gameMiddlewareLib = require('./middleware/gameMiddleware.js');
const { validateUser } = require('./middleware/validateUser.js');
const { injectGame, injectGameId,
  addPlayerToGame, isUserInGame } = gameMiddlewareLib;

const homePageLib = require('./handlers/homePage.js');
const { serveHomePage, serveLobby, redirectToLobby } = homePageLib;
const { hostGame } = require('./handlers/hostGameHandler.js');

const { createLoginRouter } = require('./routers/loginRouter.js');
const { createApiRouter } = require('./routers/apiRouter.js');
const { createGameRouter } = require('./routers/gameRouter.js');

const createApp = () => {
  const games = {};
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

  const loginRouter = createLoginRouter();
  const gameRouter = createGameRouter(games, cards, cellPositions, boardData);
  const apiRouter = createApiRouter(games);

  app.use('/login', loginRouter);
  app.use('/game', gameRouter);
  app.use('/api', apiRouter);

  app.get('/', validateUser, isUserInGame(games), serveHomePage);
  app.post('/host', validateUser, hostGame(games, cellPositions));
  app.post('/join', validateUser, injectGameId(games), injectGame(games),
    addPlayerToGame, redirectToLobby);
  app.get('/lobby/:gameId', validateUser, serveLobby);

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
