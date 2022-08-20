const express = require('express');
const { handleSuspect } = require('../handlers/optionsHandler.js');

const createSuspectRouter = () => {
  const suspectRouter = express.Router();
  suspectRouter.post('/make', handleSuspect);
  return suspectRouter;
};

module.exports = { createSuspectRouter };
