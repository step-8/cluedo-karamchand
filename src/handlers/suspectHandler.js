const acknowledgeSuspicion = (req, res) => {
  const { game, session } = req;

  game.acknowledgeSuspicion(session.userId);
  res.sendStatus(201);
};

const handleSuspect = (req, res) => {
  const { session, body, game } = req;
  const { ...suspectedCards } = body;

  game.suspect(session.userId, suspectedCards);

  res.sendStatus(201);
};

const ruleOutSuspicion = (req, res) => {
  const { game, session, body } = req;
  const { rulingOutCard } = body;

  game.ruleOutSuspicion(session.userId, rulingOutCard);
  res.sendStatus(201);
};

module.exports = { acknowledgeSuspicion, handleSuspect, ruleOutSuspicion };
