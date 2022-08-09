const serveGameApi = (req, res) => {
  res.json(req.game.state);
};

const boardApi = (boardData) => (req, res) => {
  res.json(boardData);
};

module.exports = { serveGameApi, boardApi };
