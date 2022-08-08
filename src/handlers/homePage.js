const serveHomePage = (req, res) => {
  res.sendFile('home.html', { root: 'private' });
};

const redirectToLobby = (req, res) => {
  res.redirect('/lobby');
};

const serveLobby = (req, res) => {
  res.sendFile('lobby.html', { root: 'private' });
};

module.exports = { serveHomePage, serveLobby, redirectToLobby };
