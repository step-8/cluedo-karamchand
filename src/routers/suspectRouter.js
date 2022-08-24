const express = require('express');
const {
  acknowledgeSuspicion,
  handleSuspect,
  ruleOutSuspicion
} = require('../handlers/suspectHandler.js');

const createSuspectRouter = () => {
  const suspectRouter = express.Router();

  suspectRouter.post('/make', handleSuspect);
  suspectRouter.post('/rule-out', ruleOutSuspicion);
  suspectRouter.post('/acknowledge', acknowledgeSuspicion);

  return suspectRouter;
};

module.exports = { createSuspectRouter };
