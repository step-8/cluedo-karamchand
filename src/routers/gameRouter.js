const express = require('express');
const { boardHandler } = require('../handlers/boardHandler');
const { rollDice, handleAccusation, passTurn } =
  require('../handlers/optionsHandler');
const { distributeCards } = require('../middleware/distributeCards');
const { injectGame } = require('../middleware/gameMiddleware');
const { validateUser } = require('../middleware/validateUser');
const { moveCharacter } =
  require('../handlers/rollDiceHandler.js');

const createGameRouter = (games, cards, cellPositions, boardData) => {
  const router = express.Router();

  router.use(validateUser);
  router.use(injectGame(games));

  router.get('/', distributeCards(cards), boardHandler(boardData));
  router.get('/roll-dice', rollDice(cellPositions));
  router.get('/pass-turn', passTurn);
  router.post('/accuse', handleAccusation);
  router.post('/move', moveCharacter);

  return router;
};

module.exports = { createGameRouter };
