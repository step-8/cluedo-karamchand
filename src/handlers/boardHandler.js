const boardHandler = (req, res) => {
  const { username, gameId } = req.session;
  if (!gameId) {
    return res.redirect('/');
  }
  if (!req.game.isStarted) {
    req.game.start();
  }

  res.render('game', { username });
};

module.exports = { boardHandler };
