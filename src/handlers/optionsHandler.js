const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice(diceRoller);
  game.disableDice();
  res.json(game.getState(req.session.userId));
};

const handleAccusation = (req, res) => {
  res.sendStatus(201);
};

module.exports = { rollDice, handleAccusation };
