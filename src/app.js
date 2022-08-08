const express = require('express');
const morgan = require('morgan');
const { boardHandler, boardApi } = require('./handlers/boardHandler');
require('dotenv').config();
const cookieSession = require('cookie-session');
const fs = require('fs');

const { serveHomePage,
  serveLobby,
  redirectToLobby } = require('./handlers/homePage.js');
const { validateUser } = require('./middleware/validateUser.js');
const { createLoginRouter } = require('./routers/loginRouter.js');
const { serveGameApi } = require('./handlers/api.js');
const { injectGameId } = require('./middleware/injectGameId.js');
const { injectGame } = require('./middleware/injectGame');
const { addPlayerToGame } = require('./middleware/addPlayerToGame');

const createApp = () => {
  const boardData = fs.readFileSync('data/board.json', 'utf-8');
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

  app.get('/game', boardHandler);
  app.get('/api/board', boardApi(boardData));
  app.use(express.static('public'));
  const loginRouter = createLoginRouter();
  app.use('/login', loginRouter);
  app.get('/', validateUser, serveHomePage);
  app.post('/join', validateUser, injectGameId,
    injectGame(games), addPlayerToGame, redirectToLobby);
  app.get('/lobby', validateUser, serveLobby);
  app.get('/api/game', validateUser, injectGame(games), serveGameApi);

  app.use(express.static('public'));
  return app;
};

module.exports = { createApp };
