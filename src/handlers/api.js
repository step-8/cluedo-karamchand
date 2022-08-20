const serveGameApi = (req, res) => {
  res.json(req.game.getState(req.session.userId));
};

const serveCardsApi = (cards) => (req, res) => {
  res.json(cards);
};

module.exports = { serveGameApi, serveCardsApi };
