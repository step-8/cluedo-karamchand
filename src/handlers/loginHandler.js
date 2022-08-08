const serveLogin = (request, response) => {
  response.sendFile('login.html', { root: 'private' });
};

const createSession = (username) => {
  return { username, userId: new Date().getTime() };
};

const handleLogin = (request, response) => {
  const { username } = request.body;

  if (username === '') {
    response.cookie('error', '30', { maxAge: 3000 });
    response.redirect('/login');
    return;
  }

  request.session = createSession(username);
  response.redirect('/');
};

module.exports = { serveLogin, handleLogin };
