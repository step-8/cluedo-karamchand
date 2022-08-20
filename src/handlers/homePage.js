const serveHomePage = (req, res) => {
  const { username } = req.session;
  res.render('home', { username });
};

const redirectToLobby = (req, res) => {
  const { gameId } = req.session;
  res.redirect(`/lobby/${gameId}`);
};

const serveLobby = (req, res) => {
  const { gameId } = req.session;

  if (!gameId) {
    res.redirect('/');
    return;
  }

  if (gameId !== req.params.gameId) {
    res.redirect(`/lobby/${gameId}`);
    return;
  }

  res.sendFile('lobby.html', { root: 'private' });
};

module.exports = { serveHomePage, serveLobby, redirectToLobby };
