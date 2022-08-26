const {
  CurrentPlayerVisitor,
  GeneralPlayerVisitor
} = require('../model/visitors.js');

const serveGameApi = (req, res) => {
  const { game, session } = req;
  const { userId: playerId } = session;

  const visitor = game.isCurrentPlayer(playerId) ?
    new CurrentPlayerVisitor() : new GeneralPlayerVisitor();

  game.accept(visitor, playerId);
  res.json(visitor.getJSON());
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
