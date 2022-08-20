const express = require('express');
const { boardHandler } = require('../handlers/boardHandler.js');
const { rollDice, handleAccusation, passTurn } =
  require('../handlers/optionsHandler.js');
const { injectGame, validatePlayerAction } =
  require('../middleware/gameMiddleware.js');
const { validateUser } = require('../middleware/validateUser.js');
const { moveCharacter } =
  require('../handlers/rollDiceHandler.js');
const { leaveGame } = require('../handlers/leaveGame.js');
const { createSuspectRouter } = require('./suspectRouter.js');

const createGameRouter = (games, cards, cellPositions, boardData) => {
  const gameRouter = express.Router();

  gameRouter.use(validateUser);
  gameRouter.use(injectGame(games));

  gameRouter.get('/', boardHandler(boardData, cards));
  gameRouter.post('/leave', leaveGame);
  gameRouter.use(validatePlayerAction);
  gameRouter.get('/roll-dice', rollDice(cellPositions));
  gameRouter.get('/pass-turn', passTurn);
  gameRouter.post('/accuse', handleAccusation);
  gameRouter.post('/move', moveCharacter);

  const suspectRouter = createSuspectRouter();
  gameRouter.use('/suspect', suspectRouter);
  return gameRouter;
};

module.exports = { createGameRouter };
