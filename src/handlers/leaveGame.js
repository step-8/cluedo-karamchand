const leaveGame = (req, res) => {
  req.session.gameId = null;
  res.redirect('/');
};
exports.leaveGame = leaveGame;
