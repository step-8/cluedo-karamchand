const express = require('express');
const { boardHandler } = require('../handlers/boardHandler');
const { rollDice, handleAccusation, passTurn } =
  require('../handlers/optionsHandler');
const { distributeCards } = require('../middleware/distributeCards');
const { injectGame } = require('../middleware/gameMiddleware');
const { validateUser } = require('../middleware/validateUser');
const { servePossibleMoves } = require('../handlers/rollDiceHandler.js');

const createGameRouter = (games, cards, cellPositions) => {
  const router = express.Router();

  router.use(validateUser);
  router.use(injectGame(games));

  router.get('/', distributeCards(cards), boardHandler);
  router.get('/roll-dice', rollDice);
  router.get('/pass-turn', passTurn);
  router.post('/accuse', handleAccusation);
  router.get('/possible-moves', servePossibleMoves(cellPositions));

  return router;
};

module.exports = { createGameRouter };
