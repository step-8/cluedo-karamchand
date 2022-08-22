const express = require('express');
const { boardHandler } = require('../handlers/boardHandler');
const { rollDice, handleAccusation, passTurn, handleSuspect } =
  require('../handlers/optionsHandler');
const { injectGame, validatePlayerAction } =
  require('../middleware/gameMiddleware');
const { validateUser } = require('../middleware/validateUser');
const { moveCharacter } =
  require('../handlers/rollDiceHandler.js');
const { leaveGame } = require('../handlers/leaveGame.js');

const createGameRouter = (games, cards, cellPositions, boardData) => {
  const router = express.Router();

  router.use(validateUser);
  router.use(injectGame(games));

  router.get('/', boardHandler(boardData, cards));
  router.post('/leave', leaveGame);
  router.use(validatePlayerAction);
  router.get('/roll-dice', rollDice(cellPositions));
  router.get('/pass-turn', passTurn);
  router.post('/accuse', handleAccusation);
  router.post('/move', moveCharacter);
  router.post('/suspect', handleSuspect);

  return router;
};

module.exports = { createGameRouter };
