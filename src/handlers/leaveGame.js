const leaveGame = (req, res) => {
  delete req.session.roomId;
  res.redirect('/');
};

module.exports = { leaveGame };
