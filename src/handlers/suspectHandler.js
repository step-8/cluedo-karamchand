const acknowledgeSuspicion = (req, res) => {
  const { game, session } = req;

  game.acknowledgeSuspicion(session.userId);
  res.sendStatus(201);
};

const handleSuspect = (req, res) => {
  const { body, game } = req;
  const { ...suspectedCards } = body;

  if (!game.isAllowedToSuspectRoom(suspectedCards)) {
    res.sendStatus(403);
    return;
  }

  game.suspect(suspectedCards);
  res.sendStatus(201);
};

const ruleOutSuspicion = (req, res) => {
  const { game, session, body } = req;
  const { rulingOutCard } = body;

  game.ruleOutSuspicion(session.userId, rulingOutCard);
  res.sendStatus(201);
};

module.exports = { acknowledgeSuspicion, handleSuspect, ruleOutSuspicion };
