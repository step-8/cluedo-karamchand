const serveGameApi = (req, res) => {
  res.json(req.game.getState(req.session.userId));
};

const boardApi = (boardData) => (req, res) => {
  res.json(boardData);
};

const serveCardsApi = (cards) => (req, res) => {
  res.json(cards);
};

module.exports = { serveGameApi, boardApi, serveCardsApi };
