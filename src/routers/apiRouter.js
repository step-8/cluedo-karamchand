const express = require('express');
const { serveGameApi, serveCardsApi } = require('../handlers/api.js');
const { injectGame } = require('../middleware/gameMiddleware.js');
const { validateUser } = require('../middleware/validateUser.js');

const createApiRouter = (games, boardData, cards) => {
  const router = express.Router();

  router.use(validateUser);
  router.get('/game', injectGame(games), serveGameApi);
  router.get('/cards', serveCardsApi(cards));

  return router;
};

module.exports = { createApiRouter };
