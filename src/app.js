const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cookieSession = require('cookie-session');

const { serveHomePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
const { createLoginRouter } = require('./routers/loginRouter.js');
const { boardHandler } = require('./handlers/boardHandler');
const { hostGame } = require('./handlers/hostGameHandler.js');
const { distributeCards } = require('./middleware/distributeCards.js');
const { createApiRouter } = require('./routers/apiRouter.js');
const boardData = require('../data/board.json');
const cards = require('../data/cards.json');
const { injectGame,
  injectGameId,
  addPlayerToGame, isUserInGame } = require('./middleware/gameMiddleware.js');
const { rollDice } = require('./handlers/optionsHandler.js');

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  const games = {};

  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieSession({
    name: process.env.SESSION_NAME,
    keys: [process.env.SESSION_KEYS]
  }));

  app.get('/game', validateUser, injectGame(games),
    distributeCards(cards), boardHandler);
  app.get('/game/roll-dice', validateUser, injectGame(games), rollDice);

  const loginRouter = createLoginRouter();
  app.use('/login', loginRouter);

  app.get('/', validateUser, isUserInGame(games), serveHomePage);
  app.post('/host', validateUser, hostGame(games));
  app.post('/join', validateUser, injectGameId(games),
    injectGame(games), addPlayerToGame, redirectToLobby);

  app.get('/lobby/:gameId', validateUser, serveLobby);
  app.use('/api', createApiRouter(games, boardData, cards));

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
