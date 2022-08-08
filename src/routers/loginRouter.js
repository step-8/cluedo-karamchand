const express = require('express');
const { serveLogin, handleLogin } = require('../handlers/loginHandler.js');

const createLoginRouter = () => {
  const loginRouter = express.Router();
  loginRouter.get('/', serveLogin);
  loginRouter.post('/', handleLogin);

  return loginRouter;
};

module.exports = { createLoginRouter };
