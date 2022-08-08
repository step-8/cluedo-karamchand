const addPlayerToGame = (req, res, next) => {
  const { game, session } = req;
  const { players, characters } = game;
  const character = characters[players.length];
  req.game.players.push({
    name: session.username, character, userId: session.userId
  });
  next();
};

module.exports = { addPlayerToGame };
