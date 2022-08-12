const express = require('express');
const { boardHandler } = require('../handlers/boardHandler');
const { rollDice, handleAccusation } = require('../handlers/optionsHandler');
const { distributeCards } = require('../middleware/distributeCards');
const { injectGame } = require('../middleware/gameMiddleware');
const { validateUser } = require('../middleware/validateUser');

const createGameRouter = (games, cards) => {
  const router = express.Router();

  router.use(validateUser);
  router.use(injectGame(games));

  router.get('/', distributeCards(cards), boardHandler);
  router.get('/roll-dice', rollDice);
  router.post('/accuse', handleAccusation);

  return router;
};

module.exports = { createGameRouter };
