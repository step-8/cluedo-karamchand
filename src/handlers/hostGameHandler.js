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
  const characters = [
    'scarlatte',
    'mustard',
    'green',
    'white',
    'peacock',
    'plum'
  ];

  return {
    gameId,
    players: [{ name: hostName, character: characters[0], playerId: hostId }],
    characters,
    maxPlayers
  };
};

const hostGame = (games) => (req, res) => {
  const { maxPlayers } = req.body;
  const gameId = generateGameId();
  const { userId, username } = req.session;

  games[gameId] = createGame(gameId, +maxPlayers, userId, username);
  req.session.gameId = gameId;

  res.redirect(`/lobby/${gameId}`);
};

module.exports = { hostGame };
