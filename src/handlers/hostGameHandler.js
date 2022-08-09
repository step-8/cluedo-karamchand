const { Game } = require('../model/game.js');

const randomIntBetween = (start, end) => {
  const diff = end - start;
  const randomNumber = Math.floor(Math.random() * diff);
  return randomNumber + start;
};

const generateGameId = () => {
  return Array(5).fill(0).map(() =>
    String.fromCharCode(randomIntBetween(65, 90))).join('');
};

const createGame = (gameId, maxPlayers, hostId, hostName) => {
  const game = new Game(gameId, maxPlayers);
  game.addPlayer(hostId, hostName);

  return game;
};

const hostGame = (games) => (req, res) => {
  let { maxPlayers } = req.body;
  const { userId, username } = req.session;

  maxPlayers = parseInt(maxPlayers);
  maxPlayers = maxPlayers > 2 && maxPlayers <= 6 ? maxPlayers : 3;

  const gameId = generateGameId();
  games[gameId] = createGame(gameId, maxPlayers, userId, username);
  req.session.gameId = gameId;

  res.redirect(`/lobby/${gameId}`);
};

module.exports = { hostGame };
