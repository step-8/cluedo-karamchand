const injectGame = games => (req, res, next) => {
  const game = games[req.session.gameId];
  if (game) {
    req.game = game;
    next();
    return;
  }
  res.cookie('error', '40', { maxAge: 3000 });
  res.redirect('/');
};

const addPlayerToGame = (req, res, next) => {
  const { game, session } = req;
  const { players, characters } = game;
  const character = characters[players.length];
  req.game.players.push({
    name: session.username, character, userId: session.userId
  });
  next();
};

module.exports = { injectGame, addPlayerToGame };
