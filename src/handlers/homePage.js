const homePage = (req, res) => {
  res.sendFile('home.html', { root: 'html' });
};

const injectGame = games => (req, res, next) => {
  req.game = games[123];
  next();
};

const addPlayerToGame = (req, res, next) => {
  const { game } = req;
  const player = { name: 'xyz', character: 'scarlatte', userId: 2 };
  game.players.push(player);
  next();
};

const serveLobby = (req, res) => {
  res.sendFile('lobby.html', { root: 'html' });
};

module.exports = { homePage, injectGame, addPlayerToGame, serveLobby };
