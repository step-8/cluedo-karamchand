const express = require('express');
const { createSuspectRouter } = require('./suspectRouter.js');

const { validateUser } = require('../middleware/validateUser.js');
const { initGame } = require('../middleware/initGame.js');
const { injectGame, validatePlayerAction } =
  require('../middleware/gameMiddleware.js');

const { serveGamePage } = require('../handlers/servePages.js');
const { rollDice, useSecretPassage, moveCharacter,
  handleAccusation, passTurn } = require('../handlers/actionHandler.js');
const { leaveGame } = require('../handlers/leaveHandlers.js');

const createGameRouter = (games, lobbies, cards, gameDetails, boardData) => {
  const gameRouter = express.Router();

  gameRouter.use(validateUser);
  gameRouter.use(initGame(games, lobbies, gameDetails, cards));
  gameRouter.use(injectGame(games));

  gameRouter.get('/', serveGamePage(boardData, cards));
  gameRouter.post('/leave', leaveGame);
  gameRouter.use(validatePlayerAction);

  const suspectRouter = createSuspectRouter();
  gameRouter.use('/suspect', suspectRouter);

  gameRouter.get('/roll-dice', rollDice);
  gameRouter.get('/pass-turn', passTurn);
  gameRouter.post('/accuse', handleAccusation);
  gameRouter.post('/move', moveCharacter);
  gameRouter.post('/secret-passage', useSecretPassage);

  return gameRouter;
};

module.exports = { createGameRouter };
