const serveGameApi = (req, res) => {
  res.json(req.game.getState(req.session.userId));
};

const boardApi = (boardData) => (req, res) => {
  res.json(boardData);
};

module.exports = { serveGameApi, boardApi };
