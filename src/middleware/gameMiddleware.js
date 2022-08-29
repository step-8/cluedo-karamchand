const injectLobby = (lobbies) => (req, res, next) => {
  const id = req.body['room-id'];
  const lobby = lobbies[id];
  if (!lobby) {
    res.cookie('error', '40', { maxAge: 3000 });
    return res.redirect('/');
  }

  req.lobby = lobby;
  next();
};

const injectGame = (games) => (req, res, next) => {
  const game = games[req.session.roomId];
  if (!game) {
    res.cookie('error', '40', { maxAge: 3000 });
    return res.redirect('/');
  }

  req.game = game;
  next();
};

const isUserInGame = (games) => (req, res, next) => {
  const { roomId } = req.session;

  const game = games[roomId];
  if (game) {
    return res.redirect('/game');
  }
  next();
};

const isUserInLobby = (lobbies) => (req, res, next) => {
  const { roomId } = req.session;

  const lobby = lobbies[roomId];
  if (lobby && !lobby.isFull()) {
    return res.redirect(`/lobby/${roomId}`);
  }
  next();
};

const validatePlayerAction = (req, res, next) => {
  const { game, session, url } = req;

  const action = url.slice(1).split('/').join('-');

  if (!game.isAllowed(session.userId, action)) {
    return res.sendStatus(403);
  }

  next();
};

module.exports = {
  injectLobby, injectGame, isUserInGame, isUserInLobby, validatePlayerAction
};
