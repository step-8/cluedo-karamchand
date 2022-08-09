const serveHomePage = (req, res) => {
  res.sendFile('home.html', { root: 'private' });
};

const redirectToLobby = (req, res) => {
  const { gameId } = req.session;
  res.redirect(`/lobby/${gameId}`);
};

const serveLobby = (req, res) => {
  if (req.session.gameId) {
    res.sendFile('lobby.html', { root: 'private' });
    return;
  }
  res.redirect('/');
};

module.exports = { serveHomePage, serveLobby, redirectToLobby };
