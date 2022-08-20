const boardHandler = (boardData, cards) => (req, res) => {
  const { game, session } = req;
  const { username, gameId } = session;

  if (!gameId) {
    return res.redirect('/');
  }

  if (!game.isStarted) {
    game.start();
  }

  if (!game.isReady()) {
    return res.redirect(`/lobby/${gameId}`);
  }

  res.render('game', { username, cards, boardData });
};

module.exports = { boardHandler };
