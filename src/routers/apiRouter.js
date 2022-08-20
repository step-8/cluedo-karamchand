const express = require('express');
const { serveGameApi } = require('../handlers/api.js');
const { injectGame } = require('../middleware/gameMiddleware.js');
const { validateUser } = require('../middleware/validateUser.js');

const createApiRouter = (games) => {
  const router = express.Router();

  router.use(validateUser);
  router.get('/game', injectGame(games), serveGameApi);
  return router;
};

module.exports = { createApiRouter };
