const express = require('express');
const { serveLogin, handleLogin, logout } =
  require('../handlers/authHandler.js');

const createAuthRouter = () => {
  const authRouter = express.Router();
  authRouter.get('/login', serveLogin);
  authRouter.post('/login', handleLogin);
  authRouter.get('/logout', logout);

  return authRouter;
};

module.exports = { createAuthRouter };
