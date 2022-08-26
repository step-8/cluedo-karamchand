const leaveGame = (req, res) => {
  delete req.session.roomId;
  res.redirect('/');
};

const leaveLobby = (lobbies) => (req, res) => {
  const { userId, roomId } = req.session;
  const lobby = lobbies[roomId];

  if (!lobby) {
    return res.redirect('/');
  }

  lobby.removePlayer(userId);
  delete req.session.roomId;

  res.redirect('/');
};

module.exports = { leaveGame, leaveLobby };
