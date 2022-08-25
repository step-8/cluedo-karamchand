const express = require('express');
const { validateUser } = require('../middleware/validateUser.js');
const { injectGame } = require('../middleware/gameMiddleware.js');
const { serveGameApi, serveLobbyApi } = require('../handlers/api.js');

const createApiRouter = (games, lobbies) => {
  const router = express.Router();

  router.use(validateUser);
  router.get('/game', injectGame(games), serveGameApi);
  router.get('/lobby', serveLobbyApi(lobbies));

  return router;
};

module.exports = { createApiRouter };
