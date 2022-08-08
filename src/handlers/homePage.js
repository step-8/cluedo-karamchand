const homePage = (req, res) => {
  res.sendFile('home.html', { root: 'html' });
};

const redirectToLobby = (req, res) => {
  res.redirect('/lobby');
};

const serveLobby = (req, res) => {
  res.sendFile('lobby.html', { root: 'html' });
};

module.exports = { homePage, serveLobby, redirectToLobby };
