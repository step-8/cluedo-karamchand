const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
require('dotenv').config();

const boardData = require('../data/board.json');
const cards = require('../data/cards.json');
const gameDetails = require('../data/gameDetails.json');

const { validateUser } = require('./middleware/validateUser.js');
const { injectLobby, isUserInGame, isUserInLobby } =
  require('./middleware/gameMiddleware.js');

const { serveHomePage, serveLobby } = require('./handlers/servePages.js');
const { hostGame, joinGame } = require('./handlers/hostAndJoinGame.js');

const { createAuthRouter } = require('./routers/authRouter.js');
const { createApiRouter } = require('./routers/apiRouter.js');
const { createGameRouter } = require('./routers/gameRouter.js');

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

  app.use(authRouter);

  app.use('/game', gameRouter);
  app.use('/api', apiRouter);

  app.get('/',
    validateUser, isUserInGame(games), isUserInLobby(lobbies), serveHomePage);

  app.post('/host',
    validateUser, isUserInGame(games),
    isUserInLobby(lobbies), hostGame(lobbies, cards.characters));
  app.post('/join',
    validateUser, isUserInGame(games),
    isUserInLobby(lobbies), injectLobby(lobbies), joinGame);

  app.get('/lobby/:roomId', validateUser, isUserInGame(games), serveLobby);

  app.use(compression(), express.static('public'));
  return app;
};

module.exports = { createApp };
