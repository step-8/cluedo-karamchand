const express = require('express');
const { createSuspectRouter } = require('./suspectRouter.js');

const { validateUser } = require('../middleware/validateUser.js');
const { initGame } = require('../middleware/initGame.js');
const { injectGame, validatePlayerAction } =
  require('../middleware/gameMiddleware.js');

const { boardHandler } = require('../handlers/boardHandler');
const { rollDice, handleAccusation, passTurn, useSecretPassage } =
  require('../handlers/optionsHandler');
const { moveCharacter } = require('../handlers/rollDiceHandler.js');
const { leaveGame } = require('../handlers/leaveGame.js');

const createGameRouter = (games, lobbies, cards, gameDetails, boardData) => {
  const gameRouter = express.Router();

  gameRouter.use(validateUser);
  gameRouter.use(initGame(games, lobbies, gameDetails, cards));
  gameRouter.use(injectGame(games));

  const suspectRouter = createSuspectRouter();
  gameRouter.use('/suspect', suspectRouter);

  gameRouter.get('/', boardHandler(boardData, cards));
  gameRouter.post('/leave', leaveGame);
  gameRouter.use(validatePlayerAction);
  gameRouter.get('/roll-dice', rollDice(gameDetails));
  gameRouter.get('/pass-turn', passTurn);
  gameRouter.post('/accuse', handleAccusation);
  gameRouter.post('/move', moveCharacter);
  gameRouter.post('/secret-passage', useSecretPassage);

  return gameRouter;
};

module.exports = { createGameRouter };
