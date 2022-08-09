const serveGameApi = (req, res) => {
  res.json(req.game.state);
};

module.exports = { serveGameApi };
