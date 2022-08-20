const addPlayerToGame = (req, res, next) => {
  const { game, session } = req;

  if (game.isReady()) {
    res.cookie('error', '50', { maxAge: 3000 });
    res.redirect('/');
    return;
  }

  const { userId, username } = session;
  game.addPlayer(userId, username);
  next();
};

const injectGame = games => (req, res, next) => {
  const game = games[req.session.gameId];
  if (game) {
    req.game = game;
    next();
    return;
  }
  res.cookie('error', '40', { maxAge: 3000 });
  res.redirect('/');
};

const injectGameId = games => (req, res, next) => {
  const id = req.body['room-id'];
  const game = games[id];
  if (game) {
    req.session.gameId = id;
    next();
    return;
  }

  res.cookie('error', '40', { maxAge: 3000 });
  res.redirect('/');
};

const isUserInGame = games => (req, res, next) => {
  const id = req.session.gameId;
  const game = games[id];
  if (game && game.isReady()) {
    res.redirect('/game');
    return;
  }

  if (game && !game.isReady()) {
    res.redirect(`/lobby/${id}`);
    return;
  }

  next();
};

const validateCurrentPlayer = (req, res, next) => {
  const { game, session } = req;
  if (game.isCurrentPlayer(session.userId)) {
    next();
    return;
  }

  res.sendStatus(405);
};

module.exports = {
  injectGame, injectGameId, addPlayerToGame, isUserInGame, validateCurrentPlayer
};
