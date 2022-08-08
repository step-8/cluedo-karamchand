const injectGameId = games => (req, res, next) => {
  const id = req.body['room-id'];
  const game = games[id];
  if (game) {
    req.session.gameId = id;
    next();
    return;
  }
  res.cookie('error', '40', { maxAge: 3000 });
  res.redirect('/');
};
exports.injectGameId = injectGameId;
