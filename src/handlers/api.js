const serveGameApi = (req, res) => {
  res.json(req.game.getState(req.session.userId));
};

const serveLobbyApi = (lobbies) => (req, res) => {
  const { session: { userId, roomId } } = req;
  const lobby = lobbies[roomId];

  if (!lobby) {
    return res.status(403).json({ error: 'Action forbidden' });
  }

  const lobbyStats = lobby.getStats();
  const { players } = lobbyStats;
  const you = players.find(({ id }) => id === userId);
  const allPlayers = players.map(({ name, character }) =>
    ({ name, character }));

  res.json({ ...lobbyStats, players: allPlayers, you });
};

module.exports = { serveGameApi, serveLobbyApi };
