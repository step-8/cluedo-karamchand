const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cookieSession = require('cookie-session');

const { serveHomePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
const { createLoginRouter } = require('./routers/loginRouter.js');
const { serveGameApi } = require('./handlers/api.js');
const { boardHandler, boardApi } = require('./handlers/boardHandler');
const { injectGameId } = require('./middleware/injectGameId.js');
const { injectGame } = require('./middleware/injectGame');
const { addPlayerToGame } = require('./middleware/addPlayerToGame');
const boardData = require('../data/board.json');

const createApp = () => {
  const app = express();
  const MODE = process.env.ENV;

  const games = {
    123: {
      gameId: 123,
      players: [{ name: 'abc', character: 'scarlatte', userId: 1 }],
      characters: ['scarlatte', 'mustard', 'green'],
      maxPlayers: 3
    }
  };

  if (MODE === 'PRODUCTION') {
    app.use(morgan('dev'));
  }
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieSession({
    name: process.env.SESSION_NAME,
    keys: [process.env.SESSION_KEYS]
  }));

  app.get('/game', boardHandler);
  app.get('/api/board', boardApi(boardData));

  const loginRouter = createLoginRouter();
  app.use('/login', loginRouter);

  app.get('/', validateUser, serveHomePage);
  app.post('/join', validateUser, injectGameId,
    injectGame(games), addPlayerToGame, redirectToLobby);
  app.get('/lobby', validateUser, serveLobby);
  app.get('/api/game', validateUser, injectGame(games), serveGameApi);

  app.get('/game', boardHandler);

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
