const injectGame = games => (req, res, next) => {
  const game = games[req.body['room-id']];
  if (game) {
    req.game = games[123];
    next();
    return;
  }
  res.cookie('error', '40', { maxAge: 3000 });
  res.redirect('/');
};

const addPlayerToGame = (req, res, next) => {
  const { game } = req;
  const player = { name: 'xyz', character: 'scarlatte', userId: 2 };
  game.players.push(player);
  next();
};

module.exports = { injectGame, addPlayerToGame };
