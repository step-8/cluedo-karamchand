const express = require('express');
const {
  handleSuspect,
  ruleOutSuspicion
} = require('../handlers/optionsHandler.js');

const createSuspectRouter = () => {
  const suspectRouter = express.Router();

  suspectRouter.post('/make', handleSuspect);
  suspectRouter.post('/rule-out', ruleOutSuspicion);

  return suspectRouter;
};

module.exports = { createSuspectRouter };
