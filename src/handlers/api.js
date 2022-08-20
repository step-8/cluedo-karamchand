const serveGameApi = (req, res) => {
  res.json(req.game.getState(req.session.userId));
};

module.exports = { serveGameApi };
