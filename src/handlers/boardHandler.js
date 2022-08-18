const boardHandler = (boardData, cards) => (req, res) => {
  const { username, gameId } = req.session;
  if (!gameId) {
    return res.redirect('/');
  }
  if (!req.game.isStarted) {
    req.game.start();
  }

  res.render('game', { username, cards });
};

module.exports = { boardHandler };
