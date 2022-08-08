const serveLogin = (req, res) => {
  if (req.session.isPopulated) {
    res.redirect('/');
    return;
  }

  res.sendFile('login.html', { root: 'private' });
};

const createSession = (username) => {
  return { username, userId: new Date().getTime() };
};

const handleLogin = (req, res) => {
  const { username } = req.body;

  if (username === '') {
    res.cookie('error', '30', { maxAge: 3000 });
    res.redirect('/login');
    return;
  }

  req.session = createSession(username);
  res.redirect('/');
};

module.exports = { serveLogin, handleLogin };
