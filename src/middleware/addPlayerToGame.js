const addPlayerToGame = (req, res, next) => {
  const { game, session } = req;
  const { players, characters } = game;
  const character = characters[players.length];
  if (game.maxPlayers <= game.players.length) {
    res.cookie('error', '50', { maxAge: 3000 });
    res.redirect('/');
    return;
  }
  req.game.players.push({
    name: session.username, character, userId: session.userId
  });
  next();
};

module.exports = { addPlayerToGame };
