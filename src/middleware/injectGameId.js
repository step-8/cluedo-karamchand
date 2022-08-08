const injectGameId = (req, res, next) => {
  req.session.gameId = req.body['room-id'];
  next();
};
exports.injectGameId = injectGameId;
