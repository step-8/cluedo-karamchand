const injectGame = games => (req, res, next) => {
  req.game = games[123];
  next();
};

const addPlayerToGame = (req, res, next) => {
  const { game } = req;
  const player = { name: 'xyz', character: 'scarlatte', userId: 2 };
  game.players.push(player);
  next();
};

module.exports = { injectGame, addPlayerToGame };
