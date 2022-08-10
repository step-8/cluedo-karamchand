const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cookieSession = require('cookie-session');

const { serveHomePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
const { createLoginRouter } = require('./routers/loginRouter.js');
const { serveGameApi, boardApi } = require('./handlers/api.js');
const { boardHandler } = require('./handlers/boardHandler');
const { injectGameId } = require('./middleware/injectGameId.js');
const { injectGame } = require('./middleware/injectGame');
const { addPlayerToGame } = require('./middleware/addPlayerToGame');
const { hostGame } = require('./handlers/hostGameHandler.js');
const { distributeCards } = require('./middleware/distributeCards.js');
const boardData = require('../data/board.json');
const cards = require('../data/cards.json');

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

  const loginRouter = createLoginRouter();
  app.use('/login', loginRouter);

  app.get('/', validateUser, serveHomePage);
  app.post('/host', validateUser, hostGame(games));
  app.post('/join', validateUser, injectGameId(games),
    injectGame(games), addPlayerToGame, redirectToLobby);

  app.get('/lobby/:gameId', validateUser, serveLobby);
  app.get('/api/game', validateUser, injectGame(games), serveGameApi);
  app.get('/api/board', validateUser, boardApi(boardData));

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
