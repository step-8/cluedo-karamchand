const express = require('express');
const { serveGameApi, boardApi } = require('../handlers/api.js');
const { injectGame } = require('../middleware/injectGame.js');
const { validateUser } = require('../middleware/validateUser.js');

const createApiRouter = (games, boardData) => {
  const router = express.Router();

  router.use(validateUser);
  router.get('/game', injectGame(games), serveGameApi);
  router.get('/board', boardApi(boardData));

  return router;
};

module.exports = { createApiRouter };
