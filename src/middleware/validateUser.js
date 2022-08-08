const validateUser = (req, res, next) => {
  const { session } = req;
  if (session && session.username && session.userId) {
    next();
    return;
  }
  res.sendFile('login.html', { root: 'private' });
};

module.exports = { validateUser };
