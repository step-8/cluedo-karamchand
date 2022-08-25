const serveHomePage = (req, res) => {
  const { username } = req.session;
  res.render('home', { username });
};

const serveLobby = (req, res) => {
  const { roomId } = req.session;

  if (!roomId) {
    return res.redirect('/');
  }

  if (roomId !== req.params.roomId) {
    return res.redirect(`/lobby/${roomId}`);
  }

  res.sendFile('lobby.html', { root: 'private' });
};

module.exports = { serveHomePage, serveLobby };
