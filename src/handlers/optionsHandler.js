const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice(diceRoller);
  res.json(game.getState(req.session.userId));
};

const handleAccusation = (req, res) => {
  const { session, body, game } = req;
  const { ...accusedCards } = body;
  game.accuse(session.userId, accusedCards);
  res.sendStatus(201);
};

const passTurn = (req, res) => {
  const { game } = req;
  game.passTurn();
  res.json(game.getState(req.session.userId));
};

module.exports = { rollDice, handleAccusation, passTurn };
