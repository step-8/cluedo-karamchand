const validateUser = (req, res, next) => {
  const { session } = req;
  if (session && session.username && session.userId) {
    next();
    return;
  }
  res.redirect('/login');
};

module.exports = { validateUser };
