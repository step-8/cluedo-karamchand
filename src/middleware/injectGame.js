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

module.exports = { injectGame }
