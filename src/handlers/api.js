const serveGameApi = (req, res) => {
  res.json(req.game);
};

module.exports = { serveGameApi };
