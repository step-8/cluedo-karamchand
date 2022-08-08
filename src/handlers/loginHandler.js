const serveLogin = (request, response) => {
  response.sendFile('login.html', { root: 'private' });
};

const createSession = (username) => {
  return { username, userId: new Date().getTime() };
};

const handleLogin = (request, response) => {
  const { username } = request.body;

  request.session = createSession(username);
  response.redirect('/');
};

module.exports = { serveLogin, handleLogin };
