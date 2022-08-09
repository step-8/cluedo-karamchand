const addPlayerToGame = (req, res, next) => {
  const { game, session } = req;

  if (game.isReady()) {
    res.cookie('error', '50', { maxAge: 3000 });
    res.redirect('/');
    return;
  }

  const { userId, username } = session;
  game.addPlayer(userId, username);
  next();
};

module.exports = { addPlayerToGame };
