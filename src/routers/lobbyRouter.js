const express = require('express');
const { validateUser } = require('../middleware/validateUser.js');
const { isUserInGame, isUserInLobby, injectLobby } =
  require('../middleware/gameMiddleware.js');

const { hostGame, joinGame } = require('../handlers/hostAndJoinGame.js');
const { serveLobby } = require('../handlers/servePages');
const { leaveLobby } = require('../handlers/leaveHandlers.js');

const createLobbyRouter = (games, lobbies, cards) => {
  const lobbyRouter = express.Router();

  lobbyRouter.use(validateUser);
  lobbyRouter.use(isUserInGame(games));
  lobbyRouter.get('/:roomId', serveLobby);
  lobbyRouter.post('/leave', leaveLobby(lobbies));

  lobbyRouter.use(isUserInLobby(lobbies));
  lobbyRouter.post('/host', hostGame(lobbies, cards.characters));
  lobbyRouter.post('/join', injectLobby(lobbies), joinGame);

  return lobbyRouter;
};

module.exports = { createLobbyRouter };
